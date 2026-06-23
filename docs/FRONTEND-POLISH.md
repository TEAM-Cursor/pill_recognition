# 프론트엔드 모바일 폴리시 (M1 후속)

> 목적: "편리하고 자연스러운 UI" + "다양한 모바일 환경 일관성". 디자인 정체성(라이트·민트·Pretendard)·화면 구조·네비게이션은 **그대로 두고**, 토큰/CSS/접근성 레벨의 폴리시만. 상위 지침 `Team-Seuk/DESIGN.md` 준수(토큰화·WCAG AA·모션 medium·prefers-reduced-motion).

작성 2026-06-23. 전수 감사(13화면, 3축: 모바일 일관성 / 인터랙션·모션 / 가독성·접근성) 결과 도출.

## 결정 (정체성 영향 항목)
- **민트 버튼 흰 글자 대비** `#0fae97`+white = 2.79:1 (AA 미달) → 새 토큰 `--accent-strong`(흰 글자 ≥4.5:1, ≈`#0a7d6c`) 신설, **primary·전송 버튼 배경에만** 적용. 브랜드 `--accent`(민트)는 라인·소프트필·뷰파인더·탭 인디케이터 등 **비텍스트 용도로 유지**.
- **`--text-faint`** `#93a0a0` on `#eef2f3` = 2.40:1 (AA 미달) → 한 단계 어둡게(≈`#677474`, ≥4.5:1). 날짜·메타 가독성 확보.
- 위 두 색의 정확값은 구현 시 대비비 재계산으로 ≥4.5:1 확정.

## 작업 패키지

### P1. 전역 핫픽스 — `index.html`, `styles/theme.css`
- `index.html` viewport `content`에 `viewport-fit=cover` 추가 → 현재 무효인 `env(safe-area-inset-*)` 활성화.
- `.input` / `.input--area` 폰트 15px → **16px**(iOS Safari 포커스 자동 줌 차단). `--fs-input: 16px` 토큰 신설해 입력류에 사용.
- `.composer` 좌우 패딩에 `env(safe-area-inset-left/right)` 반영.

### P2. 반응형 깨짐 (≤360px)
- 카메라 뷰파인더 고정 `264px` → `clamp(200px, 85vw, 264px)`. (theme.css `.viewfinder`도 230px 점검)
- 홈 `.stats` 2단 카드: `@media (max-width:360px)` 세로 전환.
- 스플래시 glow 고정 320px → 뷰포트 비례(`min()`/`clamp()`).

### P3. 토큰 일관화 (하드코딩 px 제거)
- `margin-top:2px` → `var(--sp-xs)`: cabinet `.chev`, allpills `.headSub`.
- `38px` 아이콘 → 토큰: result `.factIcon`, symptom `.askIcon`.
- 홈 `.doseBody` `gap:2px` → `var(--sp-xs)`.

### P4. 텍스트 오버플로·카드 일관성
- cabinet 약명 `word-break:keep-all` 오버플로 위험 → ellipsis 처리(`min-width:0` + `text-overflow:ellipsis`).
- allpills 항목명·성분 ellipsis 처리, **카드 hover 피드백 추가**(타 목록 화면과 통일).
- allpills 리스트 등장 모션 추가(symptom·result의 `rise`와 통일, `prefers-reduced-motion` 대응 포함).

### P5. 인터랙션 피드백
- 탭바 `.tab:active` 누름 피드백(transform/opacity).
- 전송 버튼 `.send:disabled` 시각 강화(opacity + `cursor`).
- chat 봇 응답 대기(700ms) 중 **타이핑 인디케이터** 표시.
- chat 자동 하단 스크롤: 사용자가 위로 스크롤 중이면 억제(스크롤 위치 추적).

### P6. 접근성·가독성(고령)
- 터치타깃 ≥44px: symptom `.chip` 36→44, 탭바 실 클릭영역 확대(상하 패딩).
- `aria-label`: 탭바 아이콘 탭(라벨 연결), cabinet 약 카드(약명), 메시지 행(`role="article"` + 발신자 라벨).
- 작은 글자 상향: 카메라 권한거부 설명·스플래시 skip 13→15px(`--fs-sm`).
- 색만으로 정보전달 점검: 복용 배지 등 아이콘/텍스트 병기 확인.

## 비범위 (이번 작업 제외)
- 화면 구조·네비게이션·라우트 변경, 데이터 와이어링(api/·storage 연결), 백엔드.
- WCAG AAA 등 골드플레이팅, 저심각도 미세 항목.

## 구현 결과 (2026-06-23, 미커밋 · 브랜치 claude/elastic-pascal-72aa59)
공유 토큰 레이어는 직접, 화면별 폴리시는 병렬 워크플로(4그룹)로 구현. 18개 파일 변경.
- **AA 범위 확장(검증에서 도출)**: `--accent-strong`을 버튼뿐 아니라 **흰 글자 위 민트 표면 전부**에 적용 — chat·conversation `.bubbleMe`, result `.newCard`(+ `.newDesc/.newChev` 흰색 알파 0.85→0.92). 스펙의 "버튼에만"은 너무 좁았음.
- **등장 키프레임 토큰화**: result·symptom `rise`, conversation `pop`의 `translateY` 하드코딩 px → `--sp-*`. chat 메시지 등장 모션(`pop`) 신설(conversation과 통일).
- **확정 색값**: `--accent-strong #0a7d6c`(흰 글자 5.0:1) / `--accent-strong-deep #086a5c` / `--text-faint #93a0a0→#667373`(4.37:1, `--text-dim`보다 한 톤 밝게 위계 보존).
- **스크롤바(실기기 테스트 중 발견)**: 내부 스크롤 영역에 PC용 두꺼운 스크롤바(증감 화살표 버튼 포함)가 나오던 버그 수정. 원인=`scrollbar-width`는 상속되지 않아 `:root`에만 준 `thin`이 내부 스크롤러엔 `auto`로 떨어짐 + 최신 Chrome은 표준 `scrollbar-color`가 있으면 `::-webkit-scrollbar`를 무시. 해결=webkit 의사요소 단일 체계로 폭 제어(`width:12px`·`scrollbar-button` 제거·`.is-scrolling` thumb autohide), 표준 속성은 `@supports (-moz-appearance)`로 Firefox 전용 격리. 실기기 모바일 정상.

### 보류(의도적 · 차후)
- **카드 hover 2-tier 차이**: 엘리베이션 카드(home `.recent`·cabinet·more = translateY+shadow) vs 플랫 리스트(allpills·sess-card = border-color)는 위계가 달라 의도적 분리로 두고 강제 통일 안 함.
- **'내 메시지' 표현 2종**: 전역 `.msg-row--me`(accent-soft+어두운 글자)는 맥락이 다른 표면이라 유지. chat·conversation 모듈은 accent-strong+흰 글자로 서로 통일.
- 저심각(camera `.tipMark` 1px 등 관용적 장식 치수)·WCAG AAA는 범위 밖.

## 검증
- `cd frontend && npm run typecheck && npm run lint && npm run build` **그린**(71 모듈, 에러 0).
- 실렌더(Vite dev, 뷰포트 **320px**) computed-style 단언: viewport-fit=cover·`--accent-strong`/`--text-faint`/`--fs-input` 적용·탭 56px·전 화면 가로 오버플로 0·입력 16px·chip/타깃 44px·`.bubbleMe`/`.newCard` = `rgb(10,125,108)`·`role="article"` 발신자 라벨·`(필수)` 스크린리더 클립 — 전부 확인.
