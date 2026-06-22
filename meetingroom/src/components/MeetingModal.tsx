import { useState } from "react";
import { db } from "../lib/db";
import { fmtDateTimeLocal } from "../lib/date";
import { useApp } from "../state";
import type { Meeting } from "../lib/types";

type Props = {
  /** 기존 회의 보기/편집, 또는 새 회의(undefined) */
  meeting?: Meeting;
  /** 새 회의 생성 시 기본 프로젝트 */
  defaultProjectId?: string;
  onClose: () => void;
  onSaved: () => void;
};

export default function MeetingModal({ meeting, defaultProjectId, onClose, onSaved }: Props) {
  const { projects } = useApp();
  const isNew = !meeting;
  const [projectId, setProjectId] = useState(meeting?.project_id ?? defaultProjectId ?? projects[0]?.id ?? "");
  const [title, setTitle] = useState(meeting?.title ?? "");
  const [starts, setStarts] = useState(
    meeting ? fmtDateTimeLocal(meeting.starts_at) : fmtDateTimeLocal(new Date().toISOString()),
  );
  const [location, setLocation] = useState(meeting?.location ?? "");
  const [agenda, setAgenda] = useState(meeting?.agenda ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!title.trim() || !projectId) return;
    setBusy(true);
    const payload = {
      project_id: projectId,
      title: title.trim(),
      starts_at: new Date(starts).toISOString(),
      ends_at: null,
      location: location.trim() || null,
      agenda: agenda.trim() || null,
    };
    if (isNew) await db.addMeeting(payload);
    else await db.updateMeeting(meeting!.id, payload);
    setBusy(false);
    onSaved();
    onClose();
  }

  async function remove() {
    if (!meeting) return;
    if (!confirm("이 회의를 삭제할까요?")) return;
    await db.deleteMeeting(meeting.id);
    onSaved();
    onClose();
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{isNew ? "새 회의" : "회의 편집"}</h3>
        <div className="field">
          <label>프로젝트</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>제목</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 06/23(화) 회의" autoFocus />
        </div>
        <div className="field">
          <label>일시</label>
          <input type="datetime-local" value={starts} onChange={(e) => setStarts(e.target.value)} />
        </div>
        <div className="field">
          <label>장소 / 화상링크 (선택)</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="온라인, 줌 링크 등" />
        </div>
        <div className="field">
          <label>안건 / 회의내용</label>
          <textarea rows={4} value={agenda} onChange={(e) => setAgenda(e.target.value)} />
        </div>
        <div className="modal-actions">
          {!isNew && (
            <button className="btn ghost" style={{ color: "var(--danger)", marginRight: "auto" }} onClick={remove}>
              삭제
            </button>
          )}
          <button className="btn ghost" onClick={onClose}>
            취소
          </button>
          <button className="btn" onClick={save} disabled={busy}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
