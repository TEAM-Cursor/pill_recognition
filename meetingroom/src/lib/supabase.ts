import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Supabase 환경변수가 채워져 있으면 실서버 모드, 아니면 데모(localStorage) 모드 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;

/** Storage 버킷 이름 (Supabase 콘솔에서 public 버킷으로 생성) */
export const STORAGE_BUCKET = "attachments";
