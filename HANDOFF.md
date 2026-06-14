---
status: 개발
updated: 2026-06-14
summary: Expo+expo-router 더미 UI 프로토타입(M0) 코드 완료 — 온보딩·스와이프 3탭·카메라·결과채팅·요약버전. 번들·타입체크 통과, 실기기 확인 대기
---

# pill_recognition — HANDOFF

> 작업 세션 끝낼 때마다 갱신. 위 frontmatter가 상태의 단일 원본. (CONVENTIONS §4·§5)

## 마지막 작업
- Expo 프로젝트 스캐폴딩 (SDK 56, TypeScript, expo-router, `src/app` 라우팅).
- 화면 전부 더미 데이터로 구현:
  - 온보딩: 카메라 권한 요청 → 개인정보 입력 (최초 1회, 온보딩 여부 = 프로필 존재).
  - 하단 3탭 좌우 스와이프: 알약사전 / 홈 / 기타 (초기 탭 = 홈).
  - 홈: 카메라 + 정사각 뷰파인더 + 자동 인식(2.6초 더미, 탭하면 즉시) → "인식 완료" → 결과 채팅.
  - 결과 채팅: 맞춤 안내 말풍선 + 답변마다 "요약 vN" 버튼 → 누적 요약문서(모달에서 이전/다음 버전 이동), 추가 질문 시 새 버전 생성.
  - 알약사전: 기록 리스트 → 탭하면 채팅 재진입. 기타: 내 정보 수정 / 증상별 약 추천(OTC 한정 + 면책).
- SDK 56에서 expo-router가 react-navigation과 비호환 → 스와이프 탭을 `expo-router/js-top-tabs`의 `TopTabs`로 구현(외부 `@react-navigation/material-top-tabs` 미사용).
- 개인정보·기록은 AsyncStorage 로컬 저장. 인식/안내/요약/추천 로직은 `src/lib/mock.ts`의 목 함수 — 실연동 지점에 `TODO(M2~M4)` 주석.
- 검증: `expo export`(Android 번들) 성공, `tsc --noEmit` 통과. 웹 미리보기(localhost)로 온보딩·알약사전·결과채팅·요약버전 렌더 확인.
- 웹 미리보기용 플래그 `src/lib/devFlags.ts`의 `SKIP_CAMERA_GATE`(`Platform.OS==='web'`) 추가 — 웹은 카메라 권한이 거부돼 막히므로 권한 게이트를 건너뜀. **실기기(ios/android)는 정상 권한 요청, 영향 없음.**

## 다음 할 일
- 실기기/에뮬레이터에서 `npx expo start` 후 흐름·스와이프·카메라를 눈으로 확인해 M0 마무리.
- M1: web-design 프레임워크로 디자인 토큰·시그니처 확정 → `.design/system.md` 생성.
- 이후 M2(Claude 비전 인식) · M3(공공 API 3종) · M4(Claude 안내·요약) 실연동.

## 막힌 것
_해당 없음_ — 단, 웹은 pager-view/카메라 제약이 있어 시각 확인은 모바일 권장. ESLint는 미설정(필요 시 `eslint-config-expo` 추가).
