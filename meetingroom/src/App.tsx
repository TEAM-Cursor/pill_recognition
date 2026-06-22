import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { AppDataProvider, useApp } from "./state";
import { TopbarProvider, useTopbarTitle } from "./topbar";
import { getMemberId, isUnlocked } from "./lib/session";
import Gate from "./components/Gate";
import Sidebar from "./components/Sidebar";
import CalendarPage from "./pages/CalendarPage";
import ProjectPage from "./pages/ProjectPage";
import ChannelPage from "./pages/ChannelPage";
import NotesPage from "./pages/NotesPage";

function Shell() {
  const [navOpen, setNavOpen] = useState(false);
  const title = useTopbarTitle();
  return (
    <div className={"app" + (navOpen ? " nav-open" : "")}>
      <div className="scrim" onClick={() => setNavOpen(false)} />
      <Sidebar onNav={() => setNavOpen(false)} />
      <div className="main">
        <div className="topbar">
          <button className="hamburger" onClick={() => setNavOpen(true)} aria-label="메뉴">
            ☰
          </button>
          <h2>{title}</h2>
        </div>
        <div className="content">
          <Routes>
            <Route path="/" element={<CalendarPage />} />
            <Route path="/project/:id" element={<ProjectPage />} />
            <Route path="/channel/:id" element={<ChannelPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="*" element={<CalendarPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function Inner() {
  const { member } = useApp();
  const [ready, setReady] = useState(isUnlocked() && Boolean(getMemberId()));

  if (!ready || !member) {
    return <Gate onReady={() => setReady(true)} />;
  }
  return (
    <TopbarProvider>
      <Shell />
    </TopbarProvider>
  );
}

export default function App() {
  return (
    <AppDataProvider>
      <Inner />
    </AppDataProvider>
  );
}
