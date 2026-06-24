"""인식 use_case의 입출력 DTO (프레임워크 비의존).

API 스키마(pydantic)는 adapter/inbound/api/schemas 에 따로 둔다. 여기 DTO는
도메인↔어댑터 사이를 오가는 순수 데이터로, 라우터에서 응답 스키마로 변환한다.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from apps.pill.domain.value_objects.pill_attributes import PillAttributes


@dataclass(frozen=True, slots=True)
class PillCandidate:
    """매칭으로 찾은 후보 약 한 건."""

    item_seq: str  # 품목일련번호(식약처 식별자)
    name: str
    entp: str | None = None  # 제조/수입사
    image_url: str | None = None  # 실제 알약 이미지 URL
    confidence: float = 0.0  # 0.0~1.0, 속성 일치도


@dataclass(frozen=True, slots=True)
class IdentifyResult:
    """인식 결과: 추출 속성 + 후보 리스트.

    ``candidates`` 가 비었거나 최고 신뢰도가 낮으면 라우터가 재촬영을 안내한다.
    """

    attributes: PillAttributes
    candidates: list[PillCandidate] = field(default_factory=list)
