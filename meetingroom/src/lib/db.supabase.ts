// Supabase 백엔드 — VITE_SUPABASE_* 가 채워졌을 때 사용.
// 스키마는 supabase/schema.sql, 초기 데이터는 supabase/seed.sql 참고.
import { STORAGE_BUCKET, supabase } from "./supabase";
import type { Db, NewAttachment, NewMeeting, NewMessage } from "./db";
import type { Message } from "./types";

function client() {
  if (!supabase) throw new Error("Supabase 가 설정되지 않았습니다.");
  return supabase;
}

async function rows<T>(p: PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const { data, error } = await p;
  if (error) throw error;
  return data ?? [];
}

async function one<T>(p: PromiseLike<{ data: T | null; error: unknown }>): Promise<T> {
  const { data, error } = await p;
  if (error) throw error;
  if (!data) throw new Error("결과가 비어 있습니다.");
  return data;
}

export const supabaseDb: Db = {
  members: () => rows(client().from("members").select("*").order("name")),
  projects: () => rows(client().from("projects").select("*").order("sort")),
  channels: () => rows(client().from("channels").select("*").order("sort")),
  meetings: () => rows(client().from("meetings").select("*").order("starts_at")),
  messages: (channelId) =>
    rows(
      client()
        .from("messages")
        .select("*")
        .eq("channel_id", channelId)
        .order("created_at"),
    ),
  attachments: (projectId) =>
    rows(
      client()
        .from("attachments")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
    ),
  attachmentsByOwner: (ownerType, ownerIds) =>
    ownerIds.length === 0
      ? Promise.resolve([])
      : rows(
          client()
            .from("attachments")
            .select("*")
            .eq("owner_type", ownerType)
            .in("owner_id", ownerIds),
        ),
  notes: (memberId) =>
    rows(
      client()
        .from("notes")
        .select("*")
        .eq("member_id", memberId)
        .order("updated_at", { ascending: false }),
    ),

  addMessage: (m: NewMessage) =>
    one(client().from("messages").insert(m).select().single()),
  addMeeting: (m: NewMeeting) =>
    one(client().from("meetings").insert(m).select().single()),
  async updateMeeting(id, patch) {
    const { error } = await client().from("meetings").update(patch).eq("id", id);
    if (error) throw error;
  },
  async deleteMeeting(id) {
    const { error } = await client().from("meetings").delete().eq("id", id);
    if (error) throw error;
  },
  addProject: (p) => one(client().from("projects").insert(p).select().single()),
  addChannel: (c) => one(client().from("channels").insert(c).select().single()),
  addAttachment: (a: NewAttachment) =>
    one(client().from("attachments").insert(a).select().single()),
  async upsertNote(n) {
    return one(client().from("notes").upsert(n).select().single());
  },
  async deleteNote(id) {
    const { error } = await client().from("notes").delete().eq("id", id);
    if (error) throw error;
  },

  async uploadFile(file: File) {
    const path = `${Date.now()}-${file.name}`;
    const { error } = await client()
      .storage.from(STORAGE_BUCKET)
      .upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = client().storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },

  subscribeMessages(channelId, cb) {
    const channel = client()
      .channel(`messages:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        (payload) => cb(payload.new as Message),
      )
      .subscribe();
    return () => {
      void client().removeChannel(channel);
    };
  },
};
