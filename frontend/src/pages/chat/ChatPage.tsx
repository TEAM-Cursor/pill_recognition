/* 대화 모드 = 빈 채팅에서 바로 묻는 독립 화면 (탭 화면, 뒤로가기 없음).
   클로드 시작 화면처럼 비어 있고, 한 줄 물으면 대화가 열린다.
   실제 LLM 연동·세션 저장은 후속 — 지금은 정해진 안내 답으로 흐름만 보여준다. */
import { useEffect, useRef, useState } from 'react'
import PillImage from '../../components/PillImage'
import { ArrowUp } from '../../components/icons'
import styles from './ChatPage.module.css'

type Msg = { id: number; role: 'me' | 'bot'; text: string }

const EXAMPLES = ['두통에 먹을 약 알려줘', '빈속에 먹어도 될까?', '졸음이 오는 약이야?']
const BOT_REPLY = '네, 확인해 드릴게요. 약 이름이나 증상을 조금 더 알려주시면 더 정확하게 안내해 드릴게요.'

/* 약속 도우미 아바타 — 브랜드 알약을 작은 민트 원 안에 */
const ASSISTANT_LOOK = { kind: 'capsule', color: 'var(--accent)', color2: 'var(--bg-elev)' } as const

export default function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const canSend = draft.trim().length > 0
  const empty = msgs.length === 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  function send(text: string) {
    const t = text.trim()
    if (!t) return
    setMsgs((m) => [...m, { id: m.length + 1, role: 'me', text: t }])
    setDraft('')
    setTimeout(() => setMsgs((m) => [...m, { id: m.length + 1, role: 'bot', text: BOT_REPLY }]), 700)
  }

  return (
    <div className="result">
      <header className={styles.head}>
        <h1 className={styles.headTitle}>대화</h1>
        <p className={styles.headSub}>약속 도우미</p>
      </header>

      <div className={`result-scroll ${styles.scroll}`}>
        {empty ? (
          <div className={styles.empty}>
            <span className={styles.emptyAvatar} aria-hidden="true">
              <PillImage look={ASSISTANT_LOOK} size={30} />
            </span>
            <div className={styles.emptyText}>
              <h2 className={styles.emptyTitle}>무엇이든 편하게 물어보세요</h2>
              <p className={styles.emptySub}>약 이름, 증상, 복약 시간 — 떠오르는 대로 적어 주세요.</p>
            </div>
            <ul className={styles.examples}>
              {EXAMPLES.map((ex) => (
                <li key={ex}>
                  <button type="button" className={styles.exampleChip} onClick={() => send(ex)}>
                    {ex}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className={styles.list}>
            {msgs.map((m) => {
              const me = m.role === 'me'
              return (
                <div key={m.id} className={`${styles.row}${me ? ` ${styles.rowMe}` : ''}`}>
                  {!me && (
                    <span className={styles.avatar} aria-hidden="true">
                      <PillImage look={ASSISTANT_LOOK} size={20} />
                    </span>
                  )}
                  <div className={`${styles.bubble} ${me ? styles.bubbleMe : styles.bubbleBot}`}>{m.text}</div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault()
          send(draft)
        }}
      >
        <input
          className="input"
          placeholder="약속 도우미에게 물어보기"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label="메시지 입력"
        />
        <button className="send" type="submit" aria-label="보내기" disabled={!canSend}>
          <ArrowUp />
        </button>
      </form>
    </div>
  )
}
