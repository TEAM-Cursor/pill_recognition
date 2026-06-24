"""POST /api/pill/identify 엔드포인트 테스트.

main.py 등록은 P1(공용구역) 담당이라, 여기선 라우터를 자체 앱에 마운트해
P3 단독으로 동작을 검증한다(통합 시 main 의 include_router 와 동일 경로).
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient

from apps.pill.adapter.inbound.api.v1 import router as pill_router


def _client() -> TestClient:
    app = FastAPI()
    app.include_router(pill_router, prefix="/api")
    return TestClient(app)


def test_identify_happy_path() -> None:
    files = {"image": ("pill.jpg", b"\xff\xd8\xff\xe0fake", "image/jpeg")}
    res = _client().post("/api/pill/identify", files=files)

    assert res.status_code == 200
    body = res.json()
    assert body["attributes"]["shape"] == "원형"
    assert len(body["candidates"]) >= 1
    assert body["candidates"][0]["name"]
    assert body["needs_retry"] is False


def test_rejects_unsupported_mime() -> None:
    files = {"image": ("pill.gif", b"GIF89a", "image/gif")}
    res = _client().post("/api/pill/identify", files=files)
    assert res.status_code == 415


def test_rejects_empty_image() -> None:
    files = {"image": ("pill.jpg", b"", "image/jpeg")}
    res = _client().post("/api/pill/identify", files=files)
    assert res.status_code == 400
