import { NavLink } from "react-router-dom";
import { useApp } from "../state";
import { usingDemoData } from "../lib/db";
import Avatar from "./Avatar";
import type { Channel, Project } from "../lib/types";

function ChannelLink({ ch, onNav }: { ch: Channel; onNav: () => void }) {
  return (
    <NavLink to={`/channel/${ch.id}`} className="nav-item" onClick={onNav}>
      <span className="hash">{ch.kind === "forum" ? "▤" : "#"}</span>
      {ch.name}
    </NavLink>
  );
}

export default function Sidebar({ onNav }: { onNav: () => void }) {
  const { member, projects, channels } = useApp();
  const general = channels.filter((c) => c.project_id === null);
  const active = projects.filter((p) => p.status === "active");
  const archived = projects.filter((p) => p.status === "archived");
  const chOf = (p: Project) => channels.filter((c) => c.project_id === p.id);

  return (
    <aside className="sidebar">
      <div className="sidebar-head">🗓️ MeetingRoom</div>
      <div className="sidebar-scroll">
        <div className="nav-group">
          <NavLink to="/" end className="nav-item" onClick={onNav}>
            📅 캘린더
          </NavLink>
          <NavLink to="/notes" className="nav-item" onClick={onNav}>
            📝 내 메모
          </NavLink>
        </div>

        <div className="nav-group">
          <div className="nav-group-label">일반</div>
          {general.map((c) => (
            <ChannelLink key={c.id} ch={c} onNav={onNav} />
          ))}
        </div>

        <div className="nav-group">
          <div className="nav-group-label">참여 중인 해커톤</div>
          {active.map((p) => (
            <div key={p.id}>
              <NavLink to={`/project/${p.id}`} className="nav-item" onClick={onNav}>
                <span className="dot" style={{ background: p.color }} />
                {p.name}
              </NavLink>
              <div className="nav-sub">
                {chOf(p).map((c) => (
                  <ChannelLink key={c.id} ch={c} onNav={onNav} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {archived.length > 0 && (
          <div className="nav-group">
            <div className="nav-group-label">아카이브</div>
            {archived.map((p) => (
              <NavLink key={p.id} to={`/project/${p.id}`} className="nav-item" onClick={onNav}>
                <span className="dot" style={{ background: p.color }} />
                {p.name}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-foot">
        <Avatar member={member} size={30} />
        <div className="name">
          {member?.name ?? "게스트"}
          {usingDemoData && <div className="demo">데모 모드 (localStorage)</div>}
        </div>
      </div>
    </aside>
  );
}
