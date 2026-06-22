import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../lib/db";
import { fmtTime } from "../lib/date";
import { useApp } from "../state";
import { useSetTitle } from "../topbar";
import Avatar from "../components/Avatar";
import AttachmentChip from "../components/AttachmentChip";
import type { Attachment, Member, Message } from "../lib/types";

export default function ChannelPage() {
  const { id = "" } = useParams();
  const { member, members, channels, projects } = useApp();
  const channel = channels.find((c) => c.id === id);
  const project = projects.find((p) => p.id === channel?.project_id);
  useSetTitle(channel ? `${project ? project.name + " · " : ""}${channel.name}` : "채널");

  const [messages, setMessages] = useState<Message[]>([]);
  const [atts, setAtts] = useState<Record<string, Attachment[]>>({});
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const memberById = (mid: string): Member | null => members.find((m) => m.id === mid) ?? null;

  async function loadAtts(msgs: Message[]) {
    const got = await db.attachmentsByOwner("message", msgs.map((m) => m.id));
    const map: Record<string, Attachment[]> = {};
    for (const a of got) (map[a.owner_id] ??= []).push(a);
    setAtts(map);
  }

  useEffect(() => {
    if (!id) return;
    let alive = true;
    void db.messages(id).then((m) => {
      if (!alive) return;
      setMessages(m);
      void loadAtts(m);
    });
    const unsub = db.subscribeMessages(id, (m) => {
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
    });
    return () => {
      alive = false;
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  async function send() {
    const body = text.trim();
    if (!body || !member) return;
    setText("");
    await db.addMessage({ channel_id: id, author_id: member.id, body });
  }

  async function attachFile(file: File) {
    if (!member) return;
    const url = await db.uploadFile(file);
    const isImg = file.type.startsWith("image/");
    const msg = await db.addMessage({
      channel_id: id,
      author_id: member.id,
      body: isImg ? "" : `첨부: ${file.name}`,
    });
    const att = await db.addAttachment({
      owner_type: "message",
      owner_id: msg.id,
      project_id: channel?.project_id ?? null,
      kind: isImg ? "image" : "file",
      name: file.name,
      url,
    });
    setAtts((prev) => ({ ...prev, [msg.id]: [att] }));
  }

  async function attachLink() {
    if (!member) return;
    const url = prompt("링크 URL을 붙여넣으세요:");
    if (!url) return;
    const msg = await db.addMessage({ channel_id: id, author_id: member.id, body: "" });
    const att = await db.addAttachment({
      owner_type: "message",
      owner_id: msg.id,
      project_id: channel?.project_id ?? null,
      kind: "link",
      name: url,
      url,
    });
    setAtts((prev) => ({ ...prev, [msg.id]: [att] }));
  }

  if (!channel) return <div className="list-empty">채널을 찾을 수 없습니다.</div>;

  return (
    <div className="chat">
      <div className="msgs">
        {messages.length === 0 && <div className="list-empty">첫 메시지를 남겨보세요.</div>}
        {messages.map((m) => {
          const author = memberById(m.author_id);
          return (
            <div key={m.id} className="msg">
              <Avatar member={author} size={36} />
              <div className="body">
                <div className="meta">
                  <span className="who">{author?.name ?? "??"}</span>
                  <span className="when">{fmtTime(m.created_at)}</span>
                </div>
                {m.body && <div className="text">{m.body}</div>}
                {(atts[m.id] ?? []).map((a) => (
                  <div key={a.id} className="att">
                    <AttachmentChip att={a} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="composer">
        <input
          ref={fileRef}
          type="file"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void attachFile(f);
            e.target.value = "";
          }}
        />
        <button className="icon-btn" title="파일/이미지" onClick={() => fileRef.current?.click()}>
          📎
        </button>
        <button className="icon-btn" title="링크" onClick={attachLink}>
          🔗
        </button>
        <textarea
          rows={1}
          placeholder={`#${channel.name} 에 메시지 보내기`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <button className="btn" onClick={send}>
          전송
        </button>
      </div>
    </div>
  );
}
