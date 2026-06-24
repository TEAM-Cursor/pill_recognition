"""pill 도메인 조립 루트(DI). 라우터가 ``Depends(get_identify_use_case)`` 로 사용.

현재: Vision·매칭 모두 **fake** 주입 → P1/P2 없이도 /api/pill/identify 가 e2e 동작.

P1/P2 완료 후 교체 지점(이 함수 한 곳만 바꾸면 됨):
  - Vision: ``FakeVisionAdapter()`` → ``GeminiVisionAdapter(<P1 공용 Gemini 클라이언트>)``
  - 매칭:   ``FakeMatchingAdapter()`` → ``<P2 낱알식별 매칭 어댑터>()``
"""

from __future__ import annotations

from apps.pill.adapter.outbound.fake_matching_adapter import FakeMatchingAdapter
from apps.pill.adapter.outbound.fake_vision_adapter import FakeVisionAdapter
from apps.pill.app.ports.input.identify_port import IdentifyPillPort
from apps.pill.app.use_cases.identify_pill import IdentifyPillUseCase


def get_identify_use_case() -> IdentifyPillPort:
    """인식 유스케이스 제공자. (FastAPI Depends 대상)"""
    return IdentifyPillUseCase(
        vision=FakeVisionAdapter(),
        matching=FakeMatchingAdapter(),
    )
