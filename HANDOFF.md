---
status: 개발
updated: 2026-06-17
summary: 데이터 모델 v1 확정(docs/ERD.md·ERD.svg·ERD.png, PostgreSQL 대상) — 프로토타입은 서버 미구현(임시 저장). 백엔드 정본은 헥사고날(apps/도메인)로 결정했으나 아직 main 미반영(현 main은 계층형 빈 스캐폴드). 협업 골격 M0 완료, 로컬 커밋 push 대기.
repo: TEAM-Cursor/pill_recognition
---

# pill_recognition — HANDOFF

> 작업 세션 끝낼 때마다 갱신. 위 frontmatter가 상태의 단일 원본. (CONVENTIONS §4·§5)

## 마지막 작업
- **ERD 다이어그램 시각화 (2026-06-17)**: [docs/ERD.svg](docs/ERD.svg)(벡터) + [docs/ERD.png](docs/ERD.png)(3800×2368, Edge 헤드리스로 래스터화) 추가. 한/영 컬럼 병기, 까마귀발 관계 표기(1·0..1·N·0..N), PK/FK/FK?/UQ 배지, 기능별 색 그룹(계정·건강 / 인식·대화 / 약), 범례 상세화. SVG 수정 시 동일 Edge 명령으로 PNG 재생성. 커밋 `b0da2aa`까지 로컬 main 머지(push 안 함).
- **백엔드 폴더 구조 정본 결정 (2026-06-17)**: worktree마다 구조가 갈려 있음 확인 — 현 main/이 worktree는 계층형 `backend/app/{auth,core,guidance,pill}`(빈 스캐폴드), 다른 worktree(`pedantic-ritchie`)는 헥사고날 `backend/apps/<도메인>/{adapter,app,domain,tests}`. **정본은 헥사고날로 결정**(아직 main 미반영). ERD는 데이터 모델이라 폴더 구조와 독립 — 단 헥사고날에선 도메인 경계 넘는 FK는 DB 제약이 아니라 논리 ID 참조로 봐야 함.
- **데이터 모델 v1 확정 (2026-06-17)**: 앱 핵심 기능 기준 ERD 설계 → [docs/ERD.md](docs/ERD.md) 신설(mermaid 다이어그램 + DDL + 관계 + 결정). 대상 DB PostgreSQL. 결정: ①계정은 이메일+비번 스키마만 두고 프로토타입 인증 미구현(시드 dev 유저) ②촬영 이미지 서버 미저장(vision_attrs만) ③**프로토타입 단계에선 서버/DB 미구현, 프론트 임시 저장으로 진행**. PLAN.md 기술결정에 반영·링크.
- **public 전환 + 시크릿 관리 정비 (2026-06-15)**: repo private→public(이력 시크릿 스캔 클린). `backend/.env.example`(키 이름만)·`app/core/config.py`(pydantic-settings 로더, 키 기본 None) 추가, `requirements.txt`에 `pydantic-settings`. GitHub secret scanning + push protection ON. CONTRIBUTING에 키 규칙.
- **org 이전 (2026-06-15)**: `bestcow/pill_recognition` → `TEAM-Cursor/pill_recognition` (GitHub Organization 전환, 폴리레포: 프로젝트 1개 = repo 1개). 로컬 remote도 갱신.
- **문서 시스템 정비**: 끊겨 있던 `(CONVENTIONS §N)` 참조 대상 [CONVENTIONS.md](CONVENTIONS.md) 신설(문서 지도 + 갱신 규칙 §1~§6). `AGENTS.md`에 "문서 시스템(작업할 때마다 갱신)" 섹션 추가 → `CLAUDE.md`가 매 세션 로드해 HANDOFF/CHANGELOG 갱신을 트리거.
- **스택 전환**: Expo(RN) 폐기 → FastAPI(Python 3.11+) + React(TS·Vite) 웹. 기존 Expo M0는 `archive/expo-m0` 브랜치 + `expo-m0-final` 태그로 보존 후 main에서 제거. 기본 브랜치 `master`→`main`.
- **협업 스캐폴드 적용**(`_templates/repo-scaffold/`에서 복사): `.github/`(CODEOWNERS·PR템플릿·`check.yml`), `backend/`(FastAPI + `/health`), `frontend/`(Vite+React+TS + Hello), `docs/`, 통합 `.gitignore`, README, CONTRIBUTING. 빈 폴더는 `.gitkeep`, 기능 코드 없음.
- **로컬 검증 통과**: frontend typecheck·lint·`vite build` clean. backend `pip install`(fastapi 0.115.14/uvicorn 0.32.1/ruff 0.7.4)→`ruff check` All passed→`uvicorn` `/health`={"status":"ok"}.
- **GitHub push 완료**: private repo `bestcow/pill_recognition` 생성, `main`+`archive/expo-m0`+`expo-m0-final` push. CODEOWNERS는 팀원 아이디 미정이라 전부 `@bestcow`로 임시.

## 다음 할 일
- **(사람)** 팀원 4명 GitHub 아이디 확정되면 CODEOWNERS의 `@bestcow`를 담당자별로 교체 + 4명 collaborator(write) 추가. (org Base permissions를 Write로 두면 collaborator 추가 없이도 push 가능)
- **(사람)** 각 팀원: `backend/.env.example` → `backend/.env` 복사 후 키 채우기. 실제 키는 비번관리자/DM으로 공유(평문·커밋 금지).
- **(사람)** 테스트 PR 1개로 `check`(backend·frontend) status check 등록 → `main` branch protection(승인1·Require Code Owners·status check·force push 차단) → Automatically delete head branches. 상세 [CONTRIBUTING.md](CONTRIBUTING.md) §5.
- **백엔드 정본(헥사고날) main 반영**: `pedantic-ritchie`의 `backend/apps/<도메인>` 헥사고날 구조를 main으로 통합 + `AGENTS.md`(현재 `app/{auth,pill,core}` 서술)·구조 문서를 실제에 맞게 정합(CONVENTIONS §2).
- **ERD 후속 결정**: 건강정보(`health_profiles`/`medications`/`allergies`)를 `profile` 도메인으로 분리할지 / 헥사고날 도메인 경계 넘는 FK를 다이어그램에 점선(약결합)으로 표시할지.
- **(사람)** 로컬 main 커밋들(`975bd26`~`b0da2aa`, ERD 문서·다이어그램) push 여부 결정 — 아직 GitHub 미반영.
- ERD 확정됨 → 프로토타입은 [docs/ERD.md](docs/ERD.md) 구조를 프론트 임시 저장(localStorage 등)으로 흉내. 서버 영속화는 추후 같은 스키마로.
- 이후 M1(디자인 토큰) → M2~M4(카메라·비전·공공API·LLM) 실연동.
- frontend `npm audit`: vite/esbuild 관련 2건(dev-server 한정) — 데모엔 영향 적으나 추후 vite 메이저 업글로 정리 검토.

## 막힌 것
_해당 없음_ — branch protection·collaborator 추가는 팀원 아이디 확정 후 GitHub 웹에서 수동 진행.
