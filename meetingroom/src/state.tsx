import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { db } from "./lib/db";
import { getMemberId, setMemberId as persistMember } from "./lib/session";
import type { Channel, Meeting, Member, Project } from "./lib/types";

type AppData = {
  member: Member | null;
  members: Member[];
  projects: Project[];
  channels: Channel[];
  meetings: Meeting[];
  setMember: (id: string) => void;
  reloadProjects: () => Promise<void>;
  reloadChannels: () => Promise<void>;
  reloadMeetings: () => Promise<void>;
};

const Ctx = createContext<AppData | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [memberId, setMemberIdState] = useState<string | null>(getMemberId());

  useEffect(() => {
    void db.members().then(setMembers);
    void db.projects().then(setProjects);
    void db.channels().then(setChannels);
    void db.meetings().then(setMeetings);
  }, []);

  const value: AppData = {
    member: members.find((m) => m.id === memberId) ?? null,
    members,
    projects,
    channels,
    meetings,
    setMember: (id) => {
      persistMember(id);
      setMemberIdState(id);
    },
    reloadProjects: () => db.projects().then(setProjects),
    reloadChannels: () => db.channels().then(setChannels),
    reloadMeetings: () => db.meetings().then(setMeetings),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppData {
  const v = useContext(Ctx);
  if (!v) throw new Error("AppDataProvider 안에서만 사용하세요.");
  return v;
}
