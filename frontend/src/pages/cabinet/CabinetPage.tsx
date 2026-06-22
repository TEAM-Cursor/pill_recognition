import PillImage, { type PillLook } from '../../components/PillImage'
import { BookIcon, ChevronRight, ScanIcon } from '../../components/icons'
import styles from './CabinetPage.module.css'

/* 알약사전 = 비춰본 알약 기록 목록 (프로토타입: 더미 데이터) */
type Entry = { id: number; name: string; dosage: string; caution: string; date: string; look: PillLook }

const ENTRIES: Entry[] = [
  { id: 1, name: '이지엔6프로연질캡슐', dosage: '1회 1~2정 · 4~6시간 간격', caution: '하루 4g 이하 · 식후 30분', date: '6/14 17:03', look: { kind: 'oval', color: '#d6464f' } },
  { id: 2, name: '타이레놀정 500mg', dosage: '1회 1~2정 · 4~6시간 간격', caution: '저녁 공복 복용 시 속쓰림 주의', date: '6/14 09:20', look: { kind: 'caplet', color: '#eef0f2' } },
  { id: 3, name: '계보린정', dosage: '1회 1정 · 1일 3회', caution: '카페인 함유 · 야간 복용 시 수면 방해 가능', date: '6/11 22:15', look: { kind: 'round', color: '#ece6e0' } },
  { id: 4, name: '이지엔6프로연질캡슐', dosage: '1회 1~2정 · 4~6시간 간격', caution: '하루 4g 이하', date: '6/14 08:40', look: { kind: 'oval', color: '#d6464f' } },
]

/* 주의(안전정보) 카드 안 아이콘 — 페이지 인라인 SVG */
function AlertIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 3.86a2 2 0 0 0-3.42 0z" />
    </svg>
  )
}

/* 이번 주 복약 요약 (프로토타입: 더미 진행률) */
const WEEK_PCT = 80
const RING_CIRC = 2 * Math.PI * 32

export default function CabinetPage({ onOpen }: { onOpen: (id: number) => void }) {
  const isEmpty = ENTRIES.length === 0
  const ringOffset = RING_CIRC * (1 - WEEK_PCT / 100)

  return (
    <div className="screen screen--scroll">
      <h1 className="page-title">알약사전</h1>
      <p className="page-sub">
        {isEmpty
          ? '비춰본 알약이 여기에 차곡차곡 모여요'
          : `기록 ${ENTRIES.length}건 · 탭하면 이어서 물어볼 수 있어요`}
      </p>

      {isEmpty ? (
        <div className="state">
          <div className="state-icon">
            <BookIcon size={30} />
          </div>
          <p className="state-title">아직 기록이 없어요</p>
          <p className="state-desc">
            카메라로 알약을 비춰보면 복약 안내와 함께 이곳에 기록으로 남아요. 천천히 시작해 볼까요?
          </p>
          <div className="state-action">
            <span className="badge">
              <ScanIcon size={16} />
              카메라로 알약 비추기
            </span>
          </div>
        </div>
      ) : (
        <>
          <section className={styles.summary} aria-label={`이번 주 복약 ${WEEK_PCT}퍼센트`}>
            <div className={styles.ring}>
              <svg viewBox="0 0 80 80" className={styles.ringSvg} aria-hidden="true">
                <circle className={styles.ringTrack} cx="40" cy="40" r="32" />
                <circle
                  className={styles.ringFill}
                  cx="40"
                  cy="40"
                  r="32"
                  strokeDasharray={RING_CIRC}
                  strokeDashoffset={ringOffset}
                  transform="rotate(-90 40 40)"
                />
              </svg>
              <div className={styles.ringPct}>
                {WEEK_PCT}
                <span className={styles.ringUnit}>%</span>
              </div>
            </div>
            <div className={styles.summaryBody}>
              <span className={styles.summaryEyebrow}>이번 주 복약</span>
              <span className={styles.summaryLead}>잘 지키고 있어요</span>
              <span className={styles.summaryStats}>
                <b>{ENTRIES.length}</b>건 기록
                <span className={styles.statDot} aria-hidden="true" />곧 챙길 약 <b>1</b>개
              </span>
            </div>
          </section>

          <div className={styles.list}>
          {ENTRIES.map((e) => (
            <button key={e.id} className={styles.card} onClick={() => onOpen(e.id)}>
              <div className={styles.thumb}>
                <PillImage look={e.look} size={44} />
              </div>

              <div className={styles.main}>
                <div className={styles.head}>
                  <span className={styles.name}>{e.name}</span>
                  <span className={styles.date}>{e.date}</span>
                </div>

                <span className={styles.dosage}>{e.dosage}</span>

                <div className={styles.caution}>
                  <span className={styles.cautionIcon}>
                    <AlertIcon size={16} />
                  </span>
                  <span className={styles.cautionBody}>
                    <span className={styles.cautionLabel}>주의</span>
                    <span className={styles.cautionText}>{e.caution}</span>
                  </span>
                </div>

                <div className={styles.foot}>
                  이어서 물어보기
                  <span className={styles.footChev}>
                    <ChevronRight size={16} />
                  </span>
                </div>
              </div>
            </button>
          ))}
          </div>
        </>
      )}
    </div>
  )
}
