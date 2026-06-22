import { useEffect, useState } from "react";
import { db } from "../lib/db";
import { useApp } from "../state";
import { useSetTitle } from "../topbar";
import type { Note } from "../lib/types";

export default function NotesPage() {
  useSetTitle("내 메모");
  const { member } = useApp();
  const [notes, setNotes] = useState<Note[]>([]);
  const [open, setOpen] = useState<Note | "new" | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function reload() {
    if (member) void db.notes(member.id).then(setNotes);
  }
  useEffect(reload, [member]);

  function edit(n: Note | "new") {
    setOpen(n);
    setTitle(n === "new" ? "" : n.title);
    setBody(n === "new" ? "" : n.body);
  }

  async function save() {
    if (!member) return;
    await db.upsertNote({
      id: open !== "new" && open ? open.id : undefined,
      member_id: member.id,
      title: title.trim() || "제목 없음",
      body,
    });
    setOpen(null);
    reload();
  }

  async function remove() {
    if (open && open !== "new") {
      if (!confirm("이 메모를 삭제할까요?")) return;
      await db.deleteNote(open.id);
      setOpen(null);
      reload();
    }
  }

  return (
    <div className="page">
      <div className="row between" style={{ marginBottom: 14 }}>
        <div>
          <h2>📝 내 메모</h2>
          <div className="muted">나만 보이는 개인 메모장입니다.</div>
        </div>
        <button className="btn sm" onClick={() => edit("new")}>
          + 새 메모
        </button>
      </div>

      {notes.length === 0 && <div className="list-empty">아직 메모가 없습니다.</div>}
      <div className="note-list">
        {notes.map((n) => (
          <button key={n.id} className="note-card" onClick={() => edit(n)}>
            <div className="t">{n.title}</div>
            <div className="b">{n.body}</div>
          </button>
        ))}
      </div>

      {open && (
        <div className="modal-bg" onClick={() => setOpen(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{open === "new" ? "새 메모" : "메모 편집"}</h3>
            <div className="field">
              <label>제목</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
            </div>
            <div className="field">
              <label>내용</label>
              <textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
            <div className="modal-actions">
              {open !== "new" && (
                <button className="btn ghost" style={{ color: "var(--danger)", marginRight: "auto" }} onClick={remove}>
                  삭제
                </button>
              )}
              <button className="btn ghost" onClick={() => setOpen(null)}>
                취소
              </button>
              <button className="btn" onClick={save}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
