"""FastAPI 진입점. backend/ 에서 ``uvicorn main:app --reload`` 로 실행.

도메인 라우터는 각 ``apps/<도메인>/adapter/inbound/api/v1`` 에 정의한 뒤
여기서 ``app.include_router(...)`` 로 등록한다(의존성 방향 adapter → app → domain).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Yaksok")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev 서버
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# 도메인 라우터 등록 (각 라우터가 자기 prefix 를 들고 있다).
from apps.guidance.adapter.inbound.api.v1 import router as guidance_router  # noqa: E402
from apps.pill.adapter.inbound.api.v1 import router as pill_router  # noqa: E402

app.include_router(guidance_router)  # prefix=/api/guidance (라우터 내부)
app.include_router(pill_router, prefix="/api")  # → /api/pill/...
