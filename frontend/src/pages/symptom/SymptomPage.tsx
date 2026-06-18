import { useState } from 'react'
import { ChevronLeft } from '../../components/icons'
import PillImage, { type PillLook } from '../../components/PillImage'

/* 증상별 약 추천 = 증상 텍스트 → OTC 추천 (프로토타입: 더미 결과).
   ERD의 symptom_queries(user_id, symptom_text, result jsonb)에 대응. */
type Rec = { id: number; name: string; desc: string; look: PillLook }

const DUMMY: Rec[] = [
  { id: 1, name: '타이레놀정 500mg', desc: '해열·진통 · 아세트아미노펜', look: { kind: 'caplet', color: '#eef0f2' } },
  { id: 2, name: '이지엔6프로연질캡슐', desc: '진통·소염 · 덱시부프로펜', look: { kind: 'oval', color: '#d6464f' } },
  { id: 3, name: '판콜에이내복액', desc: '감기 제증상 완화', look: { kind: 'round', color: '#e6b84f' } },
]

export default function SymptomPage({ onBack }: { onBack: () => void }) {
  const [symptom, setSymptom] = useState('')
  const [results, setResults] = useState<Rec[] | null>(null)

  return (
    <div className="screen screen--scroll">
      <button className="iconbtn back-row" onClick={onBack} aria-label="뒤로">
        <ChevronLeft />
      </button>
      <h1 className="page-title">증상별 약 추천</h1>
      <p className="page-sub">증상을 입력하면 일반의약품(OTC)을 추천해드려요.</p>

      <div className="field">
        <label className="field-label" htmlFor="symptom">증상</label>
        <textarea id="symptom" className="input input--area" placeholder="예: 두통이 있고 콧물이 나요"
          value={symptom} onChange={(e) => setSymptom(e.target.value)} />
      </div>
      <button className="btn-primary" onClick={() => setResults(DUMMY)} disabled={!symptom.trim()}>
        추천받기
      </button>

      {results && (
        <>
          <div className="section-head">추천 일반의약품 · {results.length}개</div>
          <div className="rec-list">
            {results.map((r) => (
              <div key={r.id} className="rec-card">
                <div className="rec-thumb"><PillImage look={r.look} size={46} /></div>
                <div className="rec-body">
                  <div className="rec-name">{r.name}</div>
                  <div className="rec-desc">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="disclaimer">
            일반의약품 안내일 뿐 의학적 진단이 아니에요. 증상이 지속·악화되면 의사·약사와 상담하세요.
          </p>
        </>
      )}
    </div>
  )
}
