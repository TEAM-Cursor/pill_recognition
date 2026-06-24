"""가짜 매칭 어댑터 (P2 스텁) — 속성과 무관하게 더미 후보를 돌려준다.

스펙: P3 는 P2 매칭을 스텁으로 두고 시작한다. P2 의 낱알식별 리포지토리·매칭이
완성되면 DI 에서 실제 ``PillMatchingPort`` 구현으로 교체한다(이 파일은 그때 폐기).
"""

from __future__ import annotations

from apps.pill.app.dtos.identify import PillCandidate
from apps.pill.app.ports.output.matching_port import PillMatchingPort
from apps.pill.domain.value_objects.pill_attributes import PillAttributes

_DUMMY = [
    PillCandidate(
        item_seq="200000000",
        name="타이레놀정500밀리그램",
        entp="한국얀센",
        image_url=None,
        confidence=0.82,
    ),
    PillCandidate(
        item_seq="200000001",
        name="게보린정",
        entp="삼진제약",
        image_url=None,
        confidence=0.61,
    ),
]


class FakeMatchingAdapter(PillMatchingPort):
    """고정 더미 후보를 신뢰도 순으로 반환하는 스텁."""

    def match(self, attributes: PillAttributes, *, limit: int = 5) -> list[PillCandidate]:
        return _DUMMY[:limit]
