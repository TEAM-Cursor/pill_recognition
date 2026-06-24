"""pill 도메인 v1 라우터 묶음.

main.py 에서 ``from apps.pill.adapter.inbound.api.v1 import router as pill_router``
→ ``app.include_router(pill_router, prefix="/api")`` 로 등록(이 라우터 prefix 가 /pill).
※ main.py 등록은 공용구역이라 P1 담당.
"""

from __future__ import annotations

from .identify import router

__all__ = ["router"]
