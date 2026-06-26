"""의약품개요정보(e약은요, 공공데이터포털 오픈API) 수집 → pills 테이블 효능·용법·주의 보강 + 신규 적재.

낱알식별(fetch_pills.py)은 모양·색·각인만 채운다. 이 스크립트는 e약은요에서
효능(efcy)·용법(use_method)·주의(caution)를 받아:
  - item_seq 가 **일치하는 기존 행**은 효능·용법·주의만 부분 업데이트(다른 컬럼 불변)
  - e약은요에만 있는 **신규 품목(액제 등)**은 사전 검색용으로 신규 삽입(물리속성 없이 이름·효능·이미지 등)

준비: backend/.env 에 DATA_GO_KR_KEY (낱알식별과 동일 키 사용 가능).

실행 (backend/ 디렉터리에서):
  uv run python scripts/fetch_drug_info.py            # 수집 + DB 보강
  uv run python scripts/fetch_drug_info.py --dry-run  # 수집만(DB 미반영, 통계만)

엔드포인트가 바뀌면 환경변수로 교체:
  DRUG_INFO_API_URL=...getDrbEasyDrugList  uv run python scripts/fetch_drug_info.py
"""

from __future__ import annotations

import json
import os
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from scripts.fetch_pills import load_key  # noqa: E402  (.env 의 DATA_GO_KR_KEY 재사용)

API_URL = os.environ.get(
    "DRUG_INFO_API_URL",
    "http://apis.data.go.kr/1471000/DrbEasyDrugInfoService/getDrbEasyDrugList",
)
NUM_OF_ROWS = 100

# caution 한 칸에 담을 안전정보 — 라벨 + 원본 필드(있는 것만 이어 붙인다).
_CAUTION_FIELDS = (
    ("경고", "atpnWarnQesitm"),
    ("주의", "atpnQesitm"),
    ("상호작용", "intrcQesitm"),
    ("이상반응", "seQesitm"),
)


def _clean(v: Any) -> str | None:
    """문자열 정규화: 좌우 공백·비가시 공백 제거, 빈 값은 None."""
    if not isinstance(v, str):
        return None
    text = v.replace("\xa0", " ").strip()
    return text or None


def _build_caution(it: dict[str, Any]) -> str | None:
    parts = []
    for label, key in _CAUTION_FIELDS:
        val = _clean(it.get(key))
        if val:
            parts.append(f"[{label}] {val}")
    return "\n\n".join(parts) or None


def fetch_page(key: str, page: int) -> dict[str, Any]:
    query = urllib.parse.urlencode({"pageNo": page, "numOfRows": NUM_OF_ROWS, "type": "json"})
    url = f"{API_URL}?serviceKey={key}&{query}"
    with urllib.request.urlopen(url, timeout=30) as resp:
        raw = resp.read().decode("utf-8")
    data: Any = json.loads(raw)
    body = data.get("body") or data.get("response", {}).get("body")
    if body is None:
        print("예상치 못한 응답 구조:")
        print(raw[:500])
        raise SystemExit(1)
    return body


def collect(body: dict[str, Any], out: list[dict[str, Any]]) -> None:
    items = body.get("items") or []
    if isinstance(items, dict):
        items = [items]
    for it in items:
        seq = _clean(it.get("itemSeq"))
        if not seq:
            continue
        out.append(
            {
                "item_seq": seq,
                "item_name": _clean(it.get("itemName")),
                "entp_name": _clean(it.get("entpName")),
                "image_url": _clean(it.get("itemImage")),
                "efcy": _clean(it.get("efcyQesitm")),
                "use_method": _clean(it.get("useMethodQesitm")),
                "caution": _build_caution(it),
            }
        )


def update_db(rows: list[dict[str, Any]]) -> None:
    """매칭(기존 pills) 행은 efcy/use_method/caution 만 부분 갱신, 미매칭(e약은요 전용)
    품목은 사전 검색용으로 신규 삽입한다.

    - 매칭 UPDATE: ORM 벌크 UPDATE 는 행마다 1행 매칭을 기대 → 없는 item_seq 가 섞이면
      StaleDataError. 그래서 기존 item_seq 로 먼저 가른다(낱알식별 컬럼은 안 건드림).
    - 미매칭 INSERT: 모양·색·각인 없는 행(이름·효능·용법·주의·이미지만). 충돌 시 무시.
    """
    # 같은 item_seq 중복 제거(마지막 값 유지).
    rows = list({r["item_seq"]: r for r in rows}.values())

    from sqlalchemy import select, update
    from sqlalchemy.dialects.postgresql import insert as pg_insert

    from apps.pill.adapter.outbound.orm.pill_orm import PillORM
    from core.db import SessionLocal

    with SessionLocal() as db:
        existing = set(db.execute(select(PillORM.item_seq)).scalars())
        matched = [r for r in rows if r["item_seq"] in existing]
        missing = [r for r in rows if r["item_seq"] not in existing]
        before_efcy, before_total = _count_filled(db), _count_total(db)

        chunk = 500
        # 1) 매칭 — efcy/use_method/caution 만 갱신
        upd = [{k: r[k] for k in ("item_seq", "efcy", "use_method", "caution")} for r in matched]
        for start in range(0, len(upd), chunk):
            db.execute(update(PillORM), upd[start : start + chunk])

        # 2) 미매칭 — 사전 검색용 신규 삽입(물리속성 없음)
        ins = [
            {
                "item_seq": r["item_seq"],
                "item_name": r["item_name"] or "(이름 미상)",
                "entp_name": r["entp_name"],
                "image_url": r["image_url"],
                "efcy": r["efcy"],
                "use_method": r["use_method"],
                "caution": r["caution"],
            }
            for r in missing
        ]
        for start in range(0, len(ins), chunk):
            db.execute(
                pg_insert(PillORM)
                .values(ins[start : start + chunk])
                .on_conflict_do_nothing(index_elements=["item_seq"])
            )

        db.commit()
        after_efcy, after_total = _count_filled(db), _count_total(db)

    print(
        f"매칭 {len(matched)}건 갱신 · 신규 {len(missing)}건 삽입. "
        f"efcy {before_efcy}→{after_efcy} · 총 행 {before_total}→{after_total}"
    )


def _count_total(db: Any) -> int:
    from sqlalchemy import text

    return db.execute(text("select count(*) from pills")).scalar()


def _count_filled(db: Any) -> int:
    from sqlalchemy import text

    return db.execute(
        text("select count(*) from pills where efcy is not null and efcy <> ''")
    ).scalar()


def main() -> None:
    dry_run = "--dry-run" in sys.argv

    key = load_key()
    if not key:
        raise SystemExit("backend/.env 의 DATA_GO_KR_KEY 가 비어 있음.")

    first = fetch_page(key, 1)
    total = int(first.get("totalCount", 0))
    if total == 0:
        print("totalCount=0 — 인증키/엔드포인트를 확인하세요.")
        return
    print(f"e약은요 총 {total}건 수집 시작 (페이지당 {NUM_OF_ROWS})")

    rows: list[dict[str, Any]] = []
    collect(first, rows)
    pages = (total + NUM_OF_ROWS - 1) // NUM_OF_ROWS
    for page in range(2, pages + 1):
        collect(fetch_page(key, page), rows)
        if page % 10 == 0:
            print(f"  {len(rows)}/{total}")
        time.sleep(0.1)

    n_efcy = sum(1 for r in rows if r["efcy"])
    print(f"수집 완료: {len(rows)}건 (효능 있음 {n_efcy}건)")

    if dry_run:
        print("--dry-run: DB 미반영")
        return
    update_db(rows)


if __name__ == "__main__":
    main()
