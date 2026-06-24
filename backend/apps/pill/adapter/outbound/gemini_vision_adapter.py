"""Gemini Vision 어댑터 — 사진을 P1 공용 Gemini 클라이언트로 보내 속성을 추출.

설계 의도(P3):
- 외부 SDK(google-genai) 호출은 P1 의 **공용 클라이언트**가 담당한다. 이 어댑터는
  그 클라이언트를 ``GeminiVisionClient`` Protocol 로 감싸 ``VisionPort`` 를 구현한다.
  → 이 파일은 google-genai 를 직접 import 하지 않으므로, P1 이 SDK·키를 추가하기
  전에도 타입체크/임포트가 깨지지 않는다(스펙: P3 는 블록되지 말 것).
- 프롬프트는 식약처 낱알식별 분류(모양/색 enum)를 명시해 **자유서술이 아니라
  정해진 값**으로 뽑게 하고, JSON 구조화 출력을 강제한다.

P1 통합 지점:
  P1 의 공용 Gemini 클라이언트가 아래 ``GeminiVisionClient`` 시그니처(prompt+이미지
  → JSON 문자열)를 제공하거나, 얇은 래퍼로 맞춰 주입하면 그대로 실연동된다.
"""

from __future__ import annotations

import json
from enum import Enum
from typing import Any, Protocol

from apps.pill.domain.value_objects.pill_attributes import (
    Color,
    Form,
    PillAttributes,
    ScoreLine,
    Shape,
)


class GeminiVisionClient(Protocol):
    """P1 공용 Gemini 클라이언트에 요구하는 최소 계약.

    멀티모달 1회 호출(텍스트 프롬프트 + 이미지) → JSON 문자열 반환.
    response_mime_type="application/json" 등 구조화 출력 설정은 클라이언트가 담당.
    """

    def generate_json(self, *, prompt: str, image_bytes: bytes, mime_type: str) -> str: ...


# 모델에 허용하는 enum 값을 프롬프트에 그대로 노출(자유서술 방지).
_SHAPES = " · ".join(s.value for s in Shape)
_COLORS = " · ".join(c.value for c in Color)
_LINES = " · ".join(s.value for s in ScoreLine)
_FORMS = " · ".join(f.value for f in Form)

VISION_PROMPT = f"""당신은 한국 의약품 낱알식별 보조원입니다.
주어진 알약 사진 1장을 보고 물리적 속성만 객관적으로 판별하세요. 약 이름·효능은 추측하지 마세요.

반드시 아래 정해진 값 중에서만 고르고, 알아볼 수 없으면 null 을 쓰세요(추측 금지).
- shape(모양): {_SHAPES}
- color_front / color_back(색, 앞/뒤): {_COLORS}
- score_line(분할선): {_LINES}
- form(제형 추정): {_FORMS}
- imprint_front / imprint_back(각인, 앞/뒤): 알약에 새겨진 글자·숫자·기호를 그대로. 없으면 null.

한쪽 면만 보이면 보이는 면을 front 로, 반대 면은 null 로 두세요.
다음 JSON 스키마로만 답하세요(설명·코드펜스 없이 JSON 객체 하나):
{{
  "shape": string|null,
  "color_front": string|null,
  "color_back": string|null,
  "imprint_front": string|null,
  "imprint_back": string|null,
  "score_line": string|null,
  "form": string|null
}}"""


def _to_enum[E: Enum](enum_cls: type[E], raw: Any) -> E | None:
    """모델이 준 문자열을 enum 으로. 미상/비허용 값은 None."""
    if not isinstance(raw, str):
        return None
    try:
        return enum_cls(raw.strip())
    except ValueError:
        return None


def _to_imprint(raw: Any) -> str | None:
    if not isinstance(raw, str):
        return None
    text = raw.strip()
    return text or None


def parse_attributes(raw_json: str) -> PillAttributes:
    """Gemini 가 돌려준 JSON 문자열 → PillAttributes. 손상/누락에 관대하게(없으면 None)."""
    try:
        data: Any = json.loads(raw_json)
    except json.JSONDecodeError:
        return PillAttributes()
    if not isinstance(data, dict):
        return PillAttributes()
    return PillAttributes(
        shape=_to_enum(Shape, data.get("shape")),
        color_front=_to_enum(Color, data.get("color_front")),
        color_back=_to_enum(Color, data.get("color_back")),
        imprint_front=_to_imprint(data.get("imprint_front")),
        imprint_back=_to_imprint(data.get("imprint_back")),
        score_line=_to_enum(ScoreLine, data.get("score_line")),
        form=_to_enum(Form, data.get("form")),
    )


class GeminiVisionAdapter:
    """``VisionPort`` 구현 — P1 클라이언트로 Gemini 호출 후 속성 파싱."""

    def __init__(self, client: GeminiVisionClient) -> None:
        self._client = client

    def extract(self, image_bytes: bytes, mime_type: str) -> PillAttributes:
        raw = self._client.generate_json(
            prompt=VISION_PROMPT, image_bytes=image_bytes, mime_type=mime_type
        )
        return parse_attributes(raw)
