// 데모 백엔드 — Supabase 없이도 앱이 즉시 돌아가도록 localStorage 에 저장한다.
// 같은 탭 안에서의 실시간(채팅)은 간단한 pub/sub 으로 흉내낸다.
import type { Db, NewAttachment, NewMeeting, NewMessage } from "./db";
import {
  ATTACHMENTS,
  CHANNELS,
  MEETINGS,
  MEMBERS,
  MESSAGES,
  NOTES,
  PROJECTS,
} from "./seed";
import type {
  Attachment,
  Channel,
  Meeting,
  Member,
  Message,
  Note,
  Project,
} from "./types";

const KEY = "meetingroom:db:v1";

type Store = {
  members: Member[];
  projects: Project[];
  channels: Channel[];
  meetings: Meeting[];
  messages: Message[];
  attachments: Attachment[];
  notes: Note[];
};

function seedStore(): Store {
  return {
    members: MEMBERS,
    projects: PROJECTS,
    channels: CHANNELS,
    meetings: MEETINGS,
    messages: MESSAGES,
    attachments: ATTACHMENTS,
    notes: NOTES,
  };
}

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Store;
  } catch {
    /* noop */
  }
  const seeded = seedStore();
  save(seeded);
  return seeded;
}

function save(s: Store) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

// 채널별 구독자
const listeners = new Map<string, Set<(m: Message) => void>>();

export const mockDb: Db = {
  async members() {
    return clone(load().members);
  },
  async projects() {
    return clone(load().projects).sort((a, b) => a.sort - b.sort);
  },
  async channels() {
    return clone(load().channels).sort((a, b) => a.sort - b.sort);
  },
  async meetings() {
    return clone(load().meetings);
  },
  async messages(channelId) {
    return clone(load().messages)
      .filter((m) => m.channel_id === channelId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  },
  async attachments(projectId) {
    return clone(load().attachments)
      .filter((a) => a.project_id === projectId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
  async attachmentsByOwner(ownerType, ownerIds) {
    const ids = new Set(ownerIds);
    return clone(load().attachments).filter(
      (a) => a.owner_type === ownerType && ids.has(a.owner_id),
    );
  },
  async notes(memberId) {
    return clone(load().notes)
      .filter((n) => n.member_id === memberId)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  },

  async addMessage(m: NewMessage) {
    const s = load();
    const msg: Message = { id: uid(), created_at: now(), ...m };
    s.messages.push(msg);
    save(s);
    listeners.get(m.channel_id)?.forEach((cb) => cb(clone(msg)));
    return clone(msg);
  },
  async addMeeting(m: NewMeeting) {
    const s = load();
    const mt: Meeting = { id: uid(), ...m };
    s.meetings.push(mt);
    save(s);
    return clone(mt);
  },
  async updateMeeting(id, patch) {
    const s = load();
    const i = s.meetings.findIndex((m) => m.id === id);
    if (i >= 0) {
      s.meetings[i] = { ...s.meetings[i], ...patch };
      save(s);
    }
  },
  async deleteMeeting(id) {
    const s = load();
    s.meetings = s.meetings.filter((m) => m.id !== id);
    save(s);
  },
  async addProject(p) {
    const s = load();
    const proj: Project = { id: uid(), ...p };
    s.projects.push(proj);
    save(s);
    return clone(proj);
  },
  async addChannel(c) {
    const s = load();
    const ch: Channel = { id: uid(), ...c };
    s.channels.push(ch);
    save(s);
    return clone(ch);
  },
  async addAttachment(a: NewAttachment) {
    const s = load();
    const att: Attachment = { id: uid(), created_at: now(), ...a };
    s.attachments.push(att);
    save(s);
    return clone(att);
  },
  async upsertNote(n) {
    const s = load();
    if (n.id) {
      const i = s.notes.findIndex((x) => x.id === n.id);
      if (i >= 0) {
        s.notes[i] = { ...s.notes[i], ...n, updated_at: now() } as Note;
        save(s);
        return clone(s.notes[i]);
      }
    }
    const note: Note = {
      id: uid(),
      member_id: n.member_id,
      title: n.title ?? "",
      body: n.body ?? "",
      updated_at: now(),
    };
    s.notes.push(note);
    save(s);
    return clone(note);
  },
  async deleteNote(id) {
    const s = load();
    s.notes = s.notes.filter((n) => n.id !== id);
    save(s);
  },

  async uploadFile(file: File) {
    // 데모: 작은 파일은 dataURL 로, 큰 파일은 안내 텍스트
    if (file.size > 1_500_000) return "#대용량파일-데모모드에선-미저장";
    return await new Promise<string>((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.readAsDataURL(file);
    });
  },

  subscribeMessages(channelId, cb) {
    let set = listeners.get(channelId);
    if (!set) {
      set = new Set();
      listeners.set(channelId, set);
    }
    set.add(cb);
    return () => set?.delete(cb);
  },
};
