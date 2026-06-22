import { useEffect, useState } from 'react'
import styles from './Splash.module.css'

/* 랜딩 스플래시 = 앱 진입 모션. 캡슐이 열리며 그 사이로 '약속'이 차오르는 모프.
   자동 사라짐 + 탭하면 건너뛰기 + reduced-motion 대응. */
export default function Splash({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0) // 0 등장 · 1 열림 · 2 워드마크
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    if (reduce) {
      setPhase(2)
      const t = setTimeout(onDone, 900)
      return () => clearTimeout(t)
    }
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 950),
      setTimeout(() => setLeaving(true), 1600),
      setTimeout(onDone, 1950),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  function skip() {
    setLeaving(true)
    setTimeout(onDone, 320)
  }

  return (
    <div
      className={`${styles.overlay}${leaving ? ` ${styles.leaving}` : ''}`}
      onClick={skip}
      aria-label="약속 시작 화면"
    >
      <div className={styles.panel}>
        <span className={styles.glow} aria-hidden="true" />

        <div className={styles.capsule} aria-hidden="true">
          <span className={`${styles.half} ${phase >= 1 ? styles.splitL : ''}`}>
            <svg width="82" height="52" viewBox="0 0 82 52" fill="none">
              <rect x="0" y="0" width="82" height="52" rx="26" fill="var(--accent)" />
              <rect x="0" y="0" width="82" height="52" rx="26" fill="url(#splashGlossL)" />
              <defs>
                <radialGradient id="splashGlossL" cx="35%" cy="22%" r="65%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.40" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          </span>
          <span className={`${styles.half} ${styles.halfR} ${phase >= 1 ? styles.splitR : ''}`}>
            <svg width="82" height="52" viewBox="0 0 82 52" fill="none">
              <rect x="0" y="0" width="82" height="52" rx="26" fill="var(--bg-elev)" />
              <rect
                x="0.5"
                y="0.5"
                width="81"
                height="51"
                rx="25.5"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1"
                strokeOpacity="0.3"
              />
              <rect x="0" y="0" width="82" height="52" rx="26" fill="url(#splashGlossR)" />
              <line x1="2" y1="8" x2="2" y2="44" stroke="var(--accent)" strokeWidth="1.5" strokeOpacity="0.5" />
              <defs>
                <radialGradient id="splashGlossR" cx="60%" cy="22%" r="55%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.70" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </radialGradient>
              </defs>
            </svg>
          </span>
        </div>

        <div className={`${styles.brand} ${phase >= 2 ? styles.brandOn : ''}`}>
          <span className={styles.name}>약속</span>
          <span className={styles.tagline}>잊지 않게, 안심하게</span>
        </div>

        <span className={styles.skip}>탭하여 건너뛰기</span>
      </div>
    </div>
  )
}
