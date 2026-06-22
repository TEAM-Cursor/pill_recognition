import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "../lib/db";
import { fmtDateFull, fmtTime } from "../lib/date";
import { useApp } from "../state";
import { useSetTitle } from "../topbar";
import MeetingModal from "../components/MeetingModal";
import AttachmentChip from "../components/AttachmentChip";
import type { Attachment, Meeting } from "../lib/types";

type Tab = "meetings" | "files" | "channels";

export default function ProjectPage() {
  const { id = "" } = useParams();
  const { projects, channels, meetings, reloadMeetings } = useApp();
  const project = projects.find((p) => p.id === id);
  useSetTitle(project?.name ?? "프로젝트");

  const [tab, setTab] = useState<Tab>("meetings");
  const [editing, setEditing] = useState<Meeting | "new" | null>(null);
  const [files, setFiles] = useState<Attachment[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const projMeetings = meetings
    .filter((m) => m.project_id === id)
    .sort((a, b) => b.starts_at.localeCompare(a.starts_at));
  const projChannels = channels.filter((c) => c.project_id === id);

  function reloadFiles() {
    void db.attachments(id).then(setFiles);
  }
  useEffect(reloadFiles, [id]);

  async function addFile(file: File) {
    const url = await db.uploadFile(file);
    await db.addAttachment({
      owner_type: "project",
      owner_id: id,
      project_id: id,
      kind: file.type.startsWith("image/") ? "image" : "file",
      name: file.name,
      url,
    });
    reloadFiles();
  }
  async function addLink() {
    const url = prompt("링크 URL:");
    if (!url) return;
    const name = prompt("표시 이름:", url) ?? url;
    await db.addAttachment({ owner_type: "project", owner_id: id, project_id: id, kind: "link", name, url });
    reloadFiles();
  }

  if (!project) return <div className="list-empty">프로젝트를 찾을 수 없습니다.</div>;

  return (
    <div className="page">
      <div className="row between">
        <div>
          <h2>
            <span style={{ color: project.color }}>● </span>
            {project.name}
          </h2>
          <div className="muted">
            {project.status === "archived" ? "아카이브됨" : "진행 중"}
            {project.deadline && ` · 마감 ${project.deadline}`}
            {project.link && (
              <>
                {" · "}
                <a href={project.link} target="_blank" rel="noreferrer">
                  공고 링크
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="tabs">
        <button className={"tab" + (tab === "meetings" ? " on" : "")} onClick={() => setTab("meetings")}>
          회의 {projMeetings.length}
        </button>
        <button className={"tab" + (tab === "files" ? " on" : "")} onClick={() => setTab("files")}>
          자료 {files.length}
        </button>
        <button className={"tab" + (tab === "channels" ? " on" : "")} onClick={() => setTab("channels")}>
          대화방 {projChannels.length}
        </button>
      </div>

      {tab === "meetings" && (
        <>
          <div className="row between" style={{ marginBottom: 10 }}>
            <span className="muted">날짜를 클릭하면 캘린더에서도 보입니다.</span>
            <button className="btn sm" onClick={() => setEditing("new")}>
              + 회의
            </button>
          </div>
          {projMeetings.length === 0 && <div className="list-empty">아직 등록된 회의가 없습니다.</div>}
          {projMeetings.map((m) => (
            <button key={m.id} className="card" style={{ width: "100%", textAlign: "left" }} onClick={() => setEditing(m)}>
              <div className="title">{m.title}</div>
              <div className="meta">
                {fmtDateFull(m.starts_at)} · {fmtTime(m.starts_at)}
                {m.location && ` · ${m.location}`}
              </div>
              {m.agenda && <span className="agenda">{m.agenda}</span>}
            </button>
          ))}
        </>
      )}

      {tab === "files" && (
        <>
          <div className="row between" style={{ marginBottom: 10 }}>
            <span className="muted">서류 · 이미지 · 링크</span>
            <div className="row">
              <input ref={fileRef} type="file" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void addFile(f); e.target.value = ""; }} />
              <button className="btn ghost sm" onClick={() => fileRef.current?.click()}>📎 파일</button>
              <button className="btn ghost sm" onClick={addLink}>🔗 링크</button>
            </div>
          </div>
          {files.length === 0 && <div className="list-empty">첨부된 자료가 없습니다.</div>}
          <div className="row" style={{ flexWrap: "wrap", alignItems: "flex-start" }}>
            {files.map((a) => (
              <AttachmentChip key={a.id} att={a} />
            ))}
          </div>
        </>
      )}

      {tab === "channels" && (
        <>
          {projChannels.length === 0 && <div className="list-empty">대화방이 없습니다.</div>}
          {projChannels.map((c) => (
            <Link key={c.id} to={`/channel/${c.id}`} className="card" style={{ display: "block" }}>
              <div className="title">
                {c.kind === "forum" ? "▤ " : "# "}
                {c.name}
              </div>
            </Link>
          ))}
        </>
      )}

      {editing && (
        <MeetingModal
          meeting={editing === "new" ? undefined : editing}
          defaultProjectId={id}
          onClose={() => setEditing(null)}
          onSaved={reloadMeetings}
        />
      )}
    </div>
  );
}
