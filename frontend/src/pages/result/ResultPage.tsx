import { ChevronLeft, ChevronRight, PlusIcon } from '../../components/icons'
import PillImage from '../../components/PillImage'

/* 약품 상세 = 약 정보 + 요약(진입 시 바로) + 이 약에 대한 개별 세션 목록 (프로토타입: 더미) */
const SUMMARY_LINES = [
  '· 성분: 덱시부프로펜 300mg',
  '· 용법: 1회 1~2정 · 4~6시간 간격',
  '· 최대: 하루 4g 이하',
  '· 식후 30분 복용 권장',
]

type Session = { id: number; question: string; date: string }
const SESSIONS: Session[] = [
  { id: 1, question: '공복에 먹어도 되나요?', date: '6/14 17:03' },
  { id: 2, question: '두통에 몇 알이 적당해요?', date: '6/14 09:20' },
  { id: 3, question: '감기약이랑 같이 먹어도 되나요?', date: '6/11 22:15' },
]

export default function ResultPage({ onBack }: { onBack: () => void }) {
  return (
    <div className="result">
      <div className="topbar">
        <button className="iconbtn" onClick={onBack} aria-label="뒤로">
          <ChevronLeft />
        </button>
      </div>

      <div className="result-scroll">
        <div className="pill-card">
          <div className="pill-info">
            <div className="pill-name">이지엔6프로연질캡슐</div>
            <div className="pill-sub">덱시부프로펜 300mg</div>
            <div className="pill-meta">대웅제약 · 타원형 · 빨강 · 식별 -</div>
          </div>
          <div className="pill-thumb"><PillImage look={{ kind: 'oval', color: '#d6464f' }} /></div>
        </div>

        <div className="section-head">요약</div>
        <div className="summary-card">
          {SUMMARY_LINES.map((line) => (
            <div key={line} className="summary-card-line">{line}</div>
          ))}
        </div>

        <div className="section-head">대화 목록 · {SESSIONS.length}개</div>
        <div className="sess-list">
          <button className="sess-card sess-card--new">
            <span className="sess-new-icon"><PlusIcon /></span>
            <span className="sess-q">새 대화</span>
          </button>
          {SESSIONS.map((s) => (
            <button key={s.id} className="sess-card">
              <span className="sess-body">
                <div className="sess-q">{s.question}</div>
                <div className="sess-date">{s.date}</div>
              </span>
              <span className="sess-chev"><ChevronRight /></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
