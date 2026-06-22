// 데이터 접근 계층 — 화면은 이 인터페이스만 본다.
// 환경변수가 있으면 Supabase, 없으면 localStorage 데모 백엔드가 선택된다.
import { isSupabaseConfigured } from "./supabase";
import { mockDb } from "./db.mock";
import { supabaseDb } from "./db.supabase";
import type {
  Attachment,
  AttachmentOwner,
  Channel,
  Meeting,
  Member,
  Message,
  Note,
  Project,
} from "./types";

export type NewMessage = {
  channel_id: string;
  author_id: string;
  body: string;
};

export type NewAttachment = {
  owner_type: AttachmentOwner;
  owner_id: string;
  project_id: string | null;
  kind: Attachment["kind"];
  name: string;
  url: string;
};

export type NewMeeting = Omit<Meeting, "id">;

export interface Db {
  // 읽기
  members(): Promise<Member[]>;
  projects(): Promise<Project[]>;
  channels(): Promise<Channel[]>;
  meetings(): Promise<Meeting[]>;
  messages(channelId: string): Promise<Message[]>;
  attachments(projectId: string): Promise<Attachment[]>;
  attachmentsByOwner(ownerType: AttachmentOwner, ownerIds: string[]): Promise<Attachment[]>;
  notes(memberId: string): Promise<Note[]>;

  // 쓰기
  addMessage(m: NewMessage): Promise<Message>;
  addMeeting(m: NewMeeting): Promise<Meeting>;
  updateMeeting(id: string, patch: Partial<NewMeeting>): Promise<void>;
  deleteMeeting(id: string): Promise<void>;
  addProject(p: Omit<Project, "id">): Promise<Project>;
  addChannel(c: Omit<Channel, "id">): Promise<Channel>;
  addAttachment(a: NewAttachment): Promise<Attachment>;
  upsertNote(n: Partial<Note> & { member_id: string }): Promise<Note>;
  deleteNote(id: string): Promise<void>;

  /** 파일 업로드 → 공개 URL 반환 (데모 모드는 dataURL) */
  uploadFile(file: File): Promise<string>;

  /** 채널 새 메시지 실시간 구독. 정리 함수 반환 */
  subscribeMessages(channelId: string, cb: (m: Message) => void): () => void;
}

export const db: Db = isSupabaseConfigured ? supabaseDb : mockDb;

export const usingDemoData = !isSupabaseConfigured;
