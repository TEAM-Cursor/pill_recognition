"""의약품 낱알식별 정보(공공데이터포털 오픈API) 전량 수집 → 프런트 정적 JSON 생성.

임시 데이터 적재용 **일회성 스크립트**. 운영은 추후 백엔드+DB로 이전한다.
표준 라이브러리만 사용(의존성 추가 없음).

준비:
  1) https://www.data.go.kr/data/15057639/openapi.do 에서 활용신청(즉시 자동승인)
  2) 마이페이지 → '인코딩(Encoding) 인증키' 복사  (URL 인코딩된 키를 그대로 씀)
  3) backend/.env 에  DATA_GO_KR_KEY=<인코딩 인증키>  추가
실행 (backend/ 디렉터리에서):
  uv run python scripts/fetch_pills.py
결과:
  frontend/public/data/pills.json   (필요 컬럼만 추린 배열)

엔드포인트가 바뀌어 에러가 나면 환경변수로 교체 가능:
  MDCIN_API_URL=...getMdcinGrnIdntfcInfoList03  uv run python scripts/fetch_pills.py
"""

from __future__ import annotations

import json
import os
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

BACKEND_DIR = Path(__file__).resolve().parents[1]
OUT_PATH = BACKEND_DIR.parent / "frontend" / "public" / "data" / "pills.json"

API_URL = os.environ.get(
    "MDCIN_API_URL",
    "http://apis.data.go.kr/1471000/MdcinGrnIdntfcInfoService01/getMdcinGrnIdntfcInfoList01",
)
NUM_OF_ROWS = 100

# 응답(UPPER_SNAKE) → 우리 JSON(camelCase) 매핑. 필요한 것만 추린다.
FIELDS: dict[str, str] = {
    "ITEM_SEQ": "itemSeq",  # 품목일련번호(식별자)
    "ITEM_NAME": "name",  # 품목명
    "ENTP_NAME": "entp",  # 업체명
    "DRUG_SHAPE": "shape",  # 모양
    "COLOR_CLASS1": "colorFront",  # 색상(앞)
    "COLOR_CLASS2": "colorBack",  # 색상(뒤)
    "PRINT_FRONT": "printFront",  # 각인(앞)
    "PRINT_BACK": "printBack",  # 각인(뒤)
    "LINE_FRONT": "lineFront",  # 분할선(앞)
    "LINE_BACK": "lineBack",  # 분할선(뒤)
    "LENG_LONG": "lengLong",  # 크기 장축
    "LENG_SHORT": "lengShort",  # 크기 단축
    "THICK": "thick",  # 두께
    "CLASS_NAME": "className",  # 분류명
    "ETC_OTC_NAME": "etcOtc",  # 전문/일반
    "FORM_CODE_NAME": "form",  # 제형
    "CHART": "chart",  # 성상
    "ITEM_IMAGE": "image",  # 실제 알약 이미지 URL
}


def load_key() -> str:
    """backend/.env 의 DATA_GO_KR_KEY 를 읽는다(없으면 환경변수)."""
    env = BACKEND_DIR / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            stripped = line.strip()
            if stripped.startswith("DATA_GO_KR_KEY="):
                return stripped.split("=", 1)[1].strip()
    return os.environ.get("DATA_GO_KR_KEY", "")


def fetch_page(key: str, page: int) -> dict[str, Any]:
    # 인코딩 인증키는 이미 %-인코딩돼 있으므로 그대로 URL에 붙인다(재인코딩 금지).
    query = urllib.parse.urlencode({"pageNo": page, "numOfRows": NUM_OF_ROWS, "type": "json"})
    url = f"{API_URL}?serviceKey={key}&{query}"
    with urllib.request.urlopen(url, timeout=30) as resp:
        raw = resp.read().decode("utf-8")
    try:
        data: Any = json.loads(raw)
    except json.JSONDecodeError:
        print("JSON 파싱 실패 — 응답이 XML일 수 있음. 응답 앞부분:")
        print(raw[:500])
        raise
    body = data.get("body") or data.get("response", {}).get("body")
    if body is None:
        print("예상치 못한 응답 구조 — 응답 앞부분:")
        print(raw[:500])
        raise SystemExit(1)
    return body


def collect(body: dict[str, Any], out: list[dict[str, Any]]) -> None:
    items = body.get("items") or []
    if isinstance(items, dict):  # 결과가 1건이면 list가 아니라 dict로 올 수 있음
        items = [items]
    out.extend({dst: it.get(src) for src, dst in FIELDS.items()} for it in items)


def main() -> None:
    key = load_key()
    if not key:
        raise SystemExit("backend/.env 의 DATA_GO_KR_KEY 가 비어 있음.")

    first = fetch_page(key, 1)
    total = int(first.get("totalCount", 0))
    if total == 0:
        print("totalCount=0 — 인증키/엔드포인트를 확인하세요.")
        return
    print(f"총 {total}건 수집 시작 (페이지당 {NUM_OF_ROWS})")

    records: list[dict[str, Any]] = []
    collect(first, records)

    pages = (total + NUM_OF_ROWS - 1) // NUM_OF_ROWS
    for page in range(2, pages + 1):
        collect(fetch_page(key, page), records)
        if page % 10 == 0:
            print(f"  {len(records)}/{total}")
        time.sleep(0.1)  # 공공API 예의상 약간의 간격

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(records, ensure_ascii=False), encoding="utf-8")
    print(f"완료: {len(records)}건 → {OUT_PATH}")


if __name__ == "__main__":
    main()
