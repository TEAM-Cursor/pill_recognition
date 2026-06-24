"""인식 입력 포트 — 라우터(inbound)가 호출하는 유스케이스 인터페이스."""

from __future__ import annotations

from typing import Protocol

from apps.pill.app.dtos.identify import IdentifyResult


class IdentifyPillPort(Protocol):
    def execute(self, image_bytes: bytes, mime_type: str) -> IdentifyResult:
        """알약 사진 → 추출 속성 + 후보 약 결과."""
        ...
