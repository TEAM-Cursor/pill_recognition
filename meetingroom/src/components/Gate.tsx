import { useState } from "react";
import { checkPassword, unlock } from "../lib/session";
import { useApp } from "../state";
import Avatar from "./Avatar";

/** 1단계: 공용 비번 → 2단계: 이름 선택 */
export default function Gate({ onReady }: { onReady: () => void }) {
  const { members, member, setMember } = useApp();
  const [passed, setPassed] = useState(false);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);

  function submitPw(e: React.FormEvent) {
    e.preventDefault();
    if (checkPassword(pw)) {
      unlock();
      setPassed(true);
    } else {
      setErr(true);
    }
  }

  if (!passed) {
    return (
      <div className="gate">
        <form className="gate-card" onSubmit={submitPw}>
          <h1>🗓️ MeetingRoom</h1>
          <p>Team-Seuk 협업 허브 · 비밀번호를 입력하세요.</p>
          <input
            type="password"
            placeholder="사이트 비밀번호"
            value={pw}
            autoFocus
            onChange={(e) => {
              setPw(e.target.value);
              setErr(false);
            }}
          />
          {err && <div className="gate-err">비밀번호가 올바르지 않습니다.</div>}
          <div style={{ marginTop: 16 }}>
            <button className="btn" style={{ width: "100%" }} type="submit">
              입장
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="gate">
      <div className="gate-card">
        <h1>누구신가요?</h1>
        <p>이름을 선택하면 메모·메시지가 그 이름으로 저장됩니다.</p>
        <div className="member-grid">
          {members.map((m) => (
            <button
              key={m.id}
              className="member-pick"
              onClick={() => {
                setMember(m.id);
                onReady();
              }}
            >
              <Avatar member={m} size={32} />
              <span>{m.name}</span>
            </button>
          ))}
        </div>
        {member && (
          <div style={{ marginTop: 16 }}>
            <button className="btn ghost" style={{ width: "100%" }} onClick={onReady}>
              {member.name}(으)로 계속
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
