/* 알약 촬영 식별 결과 — CameraPage 가 /api/pill/identify 응답을 navigate state 로 넘겨 표시한다.
   상태가 없으면(직접 진입·새로고침) 빈 상태로 다시 촬영을 안내한다. */
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft } from '../../components/icons'
import type { IdentifyResponse } from '../../lib/api'
import styles from './IdentifyResultPage.module.css'

interface IdentifyState {
  result?: IdentifyResponse
  photoUrl?: string
}

/* 추출 속성을 사람이 읽는 칩 목록으로. null 은 건너뛴다. */
function attrChips(a: IdentifyResponse['attributes']): { label: string; value: string }[] {
  const imprint = [a.imprint_front, a.imprint_back].filter(Boolean).join(' / ')
  const color = [a.color_front, a.color_back].filter(Boolean).join(' / ')
  const line = [a.line_front, a.line_back].filter(Boolean).join(' / ')
  return [
    { label: '모양', value: a.shape ?? '' },
    { label: '색', value: color },
    { label: '각인', value: imprint },
    { label: '분할선', value: line },
    { label: '제형', value: a.form ?? '' },
  ].filter((c) => c.value)
}

export default function IdentifyResultPage() {
  const navigate = useNavigate()
  const { result, photoUrl } = (useLocation().state as IdentifyState | null) ?? {}

  const retake = () => navigate('/camera', { replace: true })

  if (!result) {
    return (
      <div className="result">
        <div className="topbar">
          <button className="iconbtn" onClick={() => navigate('/camera', { replace: true })} aria-label="뒤로">
            <ChevronLeft />
          </button>
        </div>
        <div className="state">
          <p className="state-title">촬영 결과가 없어요</p>
          <p className="state-desc">알약을 다시 촬영해 주세요.</p>
          <button className="btn-primary" onClick={retake}>
            다시 촬영
          </button>
        </div>
      </div>
    )
  }

  const chips = attrChips(result.attributes)
  const { candidates } = result

  return (
    <div className="result">
      <div className="topbar">
        <button className="iconbtn" onClick={retake} aria-label="뒤로">
          <ChevronLeft />
        </button>
      </div>

      <div className={`result-scroll ${styles.scroll}`}>
        {/* 촬영 사진 + 추출 속성 */}
        <section className={styles.hero}>
          {photoUrl && <img className={styles.photo} src={photoUrl} alt="촬영한 알약" />}
          <div className={styles.heroBody}>
            <span className="badge">인식한 특징</span>
            {chips.length ? (
              <ul className={styles.chips}>
                {chips.map((c) => (
                  <li key={c.label} className={styles.chip}>
                    <span className={styles.chipLabel}>{c.label}</span>
                    <span className={styles.chipValue}>{c.value}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.muted}>특징을 충분히 읽지 못했어요.</p>
            )}
          </div>
        </section>

        {/* 재촬영 권유 */}
        {result.needs_retry && (
          <section className={styles.retake} role="status">
            <p className={styles.retakeMsg}>{result.message ?? '알약이 잘 보이도록 다시 촬영해 주세요.'}</p>
            <button className="btn-primary" onClick={retake}>
              다시 촬영
            </button>
          </section>
        )}

        {/* 후보 약 */}
        <h2 className={styles.sectionHead}>후보 약 {candidates.length > 0 && `(${candidates.length})`}</h2>
        {candidates.length === 0 ? (
          <p className={styles.empty}>
            일치하는 약을 찾지 못했어요. 약 데이터가 아직 적재되지 않았을 수 있어요(공공데이터 적재 전).
          </p>
        ) : (
          <ul className={styles.list}>
            {candidates.map((c, i) => (
              <li key={c.item_seq} className={`card ${styles.item}`}>
                <span className={styles.rank}>{i + 1}</span>
                {c.image_url ? (
                  <img className={styles.thumb} src={c.image_url} alt="" loading="lazy" />
                ) : (
                  <span className={`${styles.thumb} ${styles.thumbEmpty}`} aria-hidden="true" />
                )}
                <span className={styles.itemBody}>
                  <span className={styles.itemName}>{c.item_name}</span>
                  <span className={styles.itemMeta}>
                    {c.entp_name ?? '제조사 미상'}
                    {c.is_otc != null && (
                      <span className={styles.otc}>{c.is_otc ? '일반' : '전문'}</span>
                    )}
                  </span>
                </span>
                <span className={styles.score} title="일치도(높을수록 일치)">
                  {c.score.toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
