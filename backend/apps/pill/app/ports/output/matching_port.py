"""매칭 출력 포트 — 속성으로 후보 약을 찾는 능력의 인터페이스.

**P2 담당.** P3 는 이 Protocol 에만 의존하고 시작은 fake 구현(가짜 후보)으로
주입한다. P2 의 낱알식별 리포지토리가 완성되면 구현체만 교체한다(블록 방지).
"""

from __future__ import annotations

from typing import Protocol

from apps.pill.app.dtos.identify import PillCandidate
from apps.pill.domain.value_objects.pill_attributes import PillAttributes


class PillMatchingPort(Protocol):
    def match(self, attributes: PillAttributes, *, limit: int = 5) -> list[PillCandidate]:
        """추출 속성 → 신뢰도 내림차순 후보 약 리스트(최대 limit개). 없으면 빈 리스트."""
        ...
