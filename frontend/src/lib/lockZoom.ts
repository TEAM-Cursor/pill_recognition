/* 앱 전역 확대(줌) 차단 — 완성도용.
   - 안드로이드/일반: index.html viewport의 maximum-scale=1·user-scalable=no로 핀치 줌 차단.
   - iOS Safari: 위 viewport 설정을 무시하므로, Safari 전용 gesture 이벤트를 막아 핀치 줌을 차단한다.
   - 더블탭 줌은 전역 touch-action: manipulation(theme.css)으로 차단(클릭/스크롤은 유지). */
export function lockZoom(): void {
  const prevent = (e: Event) => e.preventDefault()
  // Safari 전용 제스처(핀치) — 비표준이라 타입에 없어 문자열로 등록
  document.addEventListener('gesturestart', prevent, { passive: false })
  document.addEventListener('gesturechange', prevent, { passive: false })
  document.addEventListener('gestureend', prevent, { passive: false })
}
