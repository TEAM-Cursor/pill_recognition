import PillImage, { type PillLook } from '../../components/PillImage'

/* 내 기록 = 대화 세션(conversations) 목록 (프로토타입: 더미 데이터) */
type Entry = { id: number; name: string; dosage: string; caution: string; date: string; look: PillLook }

const ENTRIES: Entry[] = [
  { id: 1, name: '이지엔6프로연질캡슐', dosage: '1회 1~2정 · 4~6시간 간격', caution: '하루 4g 이하 · 식후 30분', date: '6/14 17:03', look: { kind: 'oval', color: '#d6464f' } },
  { id: 2, name: '타이레놀정 500mg', dosage: '1회 1~2정 · 4~6시간 간격', caution: '저녁 공복 복용 시 속쓰림 주의', date: '6/14 09:20', look: { kind: 'caplet', color: '#eef0f2' } },
  { id: 3, name: '계보린정', dosage: '1회 1정 · 1일 3회', caution: '카페인 함유 · 야간 복용 시 수면 방해 가능', date: '6/11 22:15', look: { kind: 'round', color: '#ece6e0' } },
  { id: 4, name: '이지엔6프로연질캡슐', dosage: '1회 1~2정 · 4~6시간 간격', caution: '하루 4g 이하', date: '6/14 08:40', look: { kind: 'oval', color: '#d6464f' } },
]

export default function CabinetPage({ onOpen }: { onOpen: (id: number) => void }) {
  return (
    <div className="screen screen--scroll">
      <h1 className="page-title">내 기록</h1>
      <p className="page-sub">기록 {ENTRIES.length}건 · 탭하면 이어 물어볼 수 있어요</p>

      <div className="cab-list">
        {ENTRIES.map((e) => (
          <button key={e.id} className="cab-card" onClick={() => onOpen(e.id)}>
            <div className="cab-main">
              <div className="cab-top">
                <span className="cab-name">{e.name}</span>
                <span className="cab-date">{e.date}</span>
              </div>
              <div className="cab-line"><span className="cab-key">용법·용량</span>{e.dosage}</div>
              <div className="cab-line"><span className="cab-key">주의</span>{e.caution}</div>
            </div>
            <div className="cab-thumb"><PillImage look={e.look} size={46} /></div>
          </button>
        ))}
      </div>
    </div>
  )
}
