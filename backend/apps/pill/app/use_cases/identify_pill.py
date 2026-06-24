"""IdentifyPillUseCase — 인식 파이프라인의 조립부.

흐름: Vision 포트로 사진→속성 추출 → 매칭 포트로 속성→후보 약 조회 → 결과 반환.
두 포트를 생성자 주입받으며 구체 구현(Gemini/실매칭/fake)을 모른다.
"""

from __future__ import annotations

from apps.pill.app.dtos.identify import IdentifyResult
from apps.pill.app.ports.output.matching_port import PillMatchingPort
from apps.pill.app.ports.output.vision_port import VisionPort


class IdentifyPillUseCase:
    def __init__(self, vision: VisionPort, matching: PillMatchingPort) -> None:
        self._vision = vision
        self._matching = matching

    def execute(self, image_bytes: bytes, mime_type: str) -> IdentifyResult:
        attributes = self._vision.extract(image_bytes, mime_type)
        candidates = self._matching.match(attributes)
        return IdentifyResult(attributes=attributes, candidates=candidates)
