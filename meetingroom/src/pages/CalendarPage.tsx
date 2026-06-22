import { useMemo, useState } from "react";
import { useApp } from "../state";
import { useSetTitle } from "../topbar";
import { DOW, fmtDateFull, fmtTime, monthGrid, sameDay } from "../lib/date";
import MeetingModal from "../components/MeetingModal";
import type { Meeting, Project } from "../lib/types";

export default function CalendarPage() {
  useSetTitle("캘린더");
  const { projects, meetings, reloadMeetings } = useApp();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Meeting | "new" | null>(null);

  const colorOf = (pid: string) => projects.find((p) => p.id === pid)?.color ?? "#888";
  const nameOf = (pid: string) => projects.find((p) => p.id === pid)?.name ?? "?";

  const visible = useMemo(
    () => meetings.filter((m) => !hidden.has(m.project_id)),
    [meetings, hidden],
  );

  function toggle(p: Project) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(p.id)) next.delete(p.id);
      else next.add(p.id);
      return next;
    });
  }

  const cells = monthGrid(cursor.getFullYear(), cursor.getMonth());
  const evOf = (d: Date) =>
    visible
      .filter((m) => sameDay(new Date(m.starts_at), d))
      .sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  // 모바일 아젠다: 다가오는 회의 묶음
  const upcoming = useMemo(() => {
    const sorted = [...visible].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    const groups: { key: string; date: Date; items: Meeting[] }[] = [];
    for (const m of sorted) {
      const d = new Date(m.starts_at);
      const key = d.toDateString();
      let g = groups.find((x) => x.key === key);
      if (!g) {
        g = { key, date: d, items: [] };
        groups.push(g);
      }
      g.items.push(m);
    }
    return groups;
  }, [visible]);

  return (
    <div className="cal-wrap">
      <div className="cal-head">
        <h2>
          {cursor.getFullYear()}년 {cursor.getMonth() + 1}월
        </h2>
        <button className="btn ghost sm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
          ‹
        </button>
        <button className="btn ghost sm" onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}>
          오늘
        </button>
        <button className="btn ghost sm" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
          ›
        </button>
        <div style={{ flex: 1 }} />
        <button className="btn sm" onClick={() => setEditing("new")}>
          + 회의
        </button>
      </div>

      <div className="cal-filters">
        {projects.map((p) => (
          <button key={p.id} className={"chip" + (hidden.has(p.id) ? "" : " on")} onClick={() => toggle(p)} style={hidden.has(p.id) ? {} : { background: p.color + "22", color: "var(--text)" }}>
            <span className="dot" style={{ background: p.color }} />
            {p.name}
          </button>
        ))}
      </div>

      {/* 데스크탑: 월 그리드 */}
      <div className="cal-grid" style={{ marginTop: 14 }}>
        {DOW.map((d) => (
          <div key={d} className="cal-dow">
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          const dim = d.getMonth() !== cursor.getMonth();
          const isToday = sameDay(d, today);
          return (
            <div key={i} className={"cal-cell" + (dim ? " dim" : "") + (isToday ? " today" : "")}>
              <div className="cal-date">{d.getDate()}</div>
              {evOf(d).map((m) => (
                <button key={m.id} className="cal-ev" style={{ background: colorOf(m.project_id) }} title={`${nameOf(m.project_id)} · ${m.title}`} onClick={() => setEditing(m)}>
                  {m.title}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      {/* 모바일: 아젠다 리스트 */}
      <div className="agenda">
        {upcoming.length === 0 && <div className="list-empty">표시할 회의가 없습니다.</div>}
        {upcoming.map((g) => (
          <div key={g.key} className="agenda-day">
            <h4>{fmtDateFull(g.items[0].starts_at)}</h4>
            {g.items.map((m) => (
              <button key={m.id} className="agenda-ev" style={{ borderLeftColor: colorOf(m.project_id) }} onClick={() => setEditing(m)}>
                <div>
                  <div className="t">{m.title}</div>
                  <div className="time">
                    {fmtTime(m.starts_at)} · {nameOf(m.project_id)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>

      {editing && (
        <MeetingModal
          meeting={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={reloadMeetings}
        />
      )}
    </div>
  );
}
