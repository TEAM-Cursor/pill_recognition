# pill_recognition

> 소개·실행법·환경변수. 의사결정·범위는 PLAN. (CONVENTIONS §6)

알약을 카메라로 비추면 개인 정보와 현재 시각에 맞춘 용법·용량·주의사항을 LLM이 안내하는 모바일 앱(React Native / Expo).

## 실행
```
npm install
npx expo start
```
- Expo Go 앱으로 QR 스캔(실기기), 또는 `a`(Android 에뮬레이터) / `i`(iOS 시뮬레이터, macOS).
- 카메라·좌우 스와이프 탭은 **모바일 권장** — 웹(`w`)은 pager-view/카메라 제약이 있음.
- 온보딩을 다시 보려면 앱 데이터(AsyncStorage)를 지우면 됨.

## 환경변수
_현재 더미 단계라 불필요. 실연동(M2~M4) 시 예정:_
- `ANTHROPIC_API_KEY` — Claude(비전·안내·요약)
- `PUBLIC_DATA_API_KEY` — 공공데이터포털 인증키(낱알식별·DUR·e약은요)
