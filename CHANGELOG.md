# pill_recognition — CHANGELOG

> 날짜별 굵직한 변경 한 줄. 세세한 커밋은 git log. (CONVENTIONS §3)

## 2026-06-18
- 프론트 프로토타입 UI 5화면 구현(홈·내 기록·약품 상세·기타·내 정보 입력): 다크+teal, 모바일 셸, 하단 탭바, 알약 이미지(SVG), `useState` 화면 전환. 더미 데이터.
- 건강정보 `localStorage` 저장/불러오기 + 온보딩 분기. ERD를 `frontend/src/lib/types.ts` 타입으로 옮김, 화면값↔DB값 매핑(나이↔출생연도·약 텍스트↔`medications` 1:N).
- ERD 다이어그램 `docs/ERD.svg`·`docs/ERD.png` 폐기 → `docs/ERD.md`만 유지(시각화는 대화 위젯으로 대체). 요약 모델 변경: `summaries` 테이블 → `conversations.summary` 한 줄 요약으로 흡수(문서 미반영, 추후 ERD.md 갱신 예정).

## 2026-06-17
- 데이터 모델 v1 확정: [docs/ERD.md](docs/ERD.md) 신설(PostgreSQL 대상, 테이블 10개). 결정: 계정/이미지 서버 미저장 정책 + **프로토타입은 서버 미구현, 프론트 임시 저장**. PLAN 기술결정에 반영.
- ERD 다이어그램 시각화: `docs/ERD.svg`(벡터)·`docs/ERD.png`(3800×2368) 추가 — 한/영 병기·까마귀발 관계·키 배지·기능별 색 그룹·범례.
- 백엔드 정본 구조를 **헥사고날(`apps/<도메인>`)** 로 결정(아직 main 미반영, `pedantic-ritchie` 브랜치에 존재).

## 2026-06-15
- repo 공개 전환: private → **public**(커밋 이력 시크릿 스캔 클린 확인 후). free org Actions 분 제한 해소.
- 시크릿 관리 정비: `backend/.env.example` + `app/core/config.py`(pydantic-settings) 추가, GitHub secret scanning + push protection 활성화, CONTRIBUTING에 키 규칙 한 줄.
- repo를 `bestcow` 개인 → `TEAM-Cursor` Organization으로 이전(`TEAM-Cursor/pill_recognition`). 로컬 remote 갱신.
- 문서 시스템 정비: `CONVENTIONS.md`(문서 지도 + 갱신 규칙 §1~§6) 신설로 끊겨 있던 `(CONVENTIONS §N)` 참조 해소, `AGENTS.md`에 "작업할 때마다 갱신" 트리거 섹션 추가.
- GitHub private repo `bestcow/pill_recognition` 생성, `main`+`archive/expo-m0` 브랜치+`expo-m0-final` 태그 push. CODEOWNERS는 `@bestcow`로 임시(팀원 합류 시 교체). branch protection은 웹 수동 예정.

## 2026-06-14
- 프로젝트 개시. 요구사항·UI 흐름 확정, 모델(Claude)·인식 방식(비전→속성→낱알식별 API)·범위 결정. 문서 4종 생성.
- (구) Expo SDK 56 + expo-router 더미 UI 프로토타입 구현 — 이후 폐기, `archive/expo-m0` 브랜치/`expo-m0-final` 태그에 보존.
- **스택 전환**: Expo(RN) 폐기 → FastAPI(Python 3.11+) + React(TS·Vite) 웹. 초보 5인 팀 협업 골격 적용: `.github/`(CODEOWNERS·PR템플릿·CI `check.yml`)·`backend/`·`frontend/`·통합 `.gitignore`·CONTRIBUTING. backend `/health`·frontend 빌드 로컬 검증 통과. 재사용 템플릿은 `_templates/repo-scaffold/`.
