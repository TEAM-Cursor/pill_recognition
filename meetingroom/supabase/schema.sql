-- MeetingRoom — Supabase 스키마
-- 실행: Supabase 콘솔 → SQL Editor 에 붙여넣고 Run.
--
-- ⚠️ 보안 모델: 이 앱은 "공용 비밀번호 게이트"로 접근을 막는 소규모 신뢰 팀용입니다.
--    그래서 anon 키로 모든 테이블을 읽고 쓸 수 있도록 RLS 를 열어둡니다(아래 정책).
--    외부에 URL 이 노출되면 누구나 접근 가능하므로, 더 강한 보안이 필요하면
--    Supabase Auth(개인 로그인) + 사용자별 RLS 로 교체하세요. (README 참고)

create table if not exists members (
  id    text primary key default gen_random_uuid()::text,
  name  text not null,
  color text not null default '#5a9ef0'
);

create table if not exists projects (
  id       text primary key default gen_random_uuid()::text,
  name     text not null,
  status   text not null default 'active' check (status in ('active','archived')),
  color    text not null default '#5a9ef0',
  deadline date,
  link     text,
  sort     int  not null default 0
);

create table if not exists channels (
  id         text primary key default gen_random_uuid()::text,
  project_id text references projects(id) on delete cascade,
  name       text not null,
  kind       text not null default 'chat' check (kind in ('chat','forum')),
  sort       int  not null default 0
);

create table if not exists meetings (
  id         text primary key default gen_random_uuid()::text,
  project_id text not null references projects(id) on delete cascade,
  title      text not null,
  starts_at  timestamptz not null,
  ends_at    timestamptz,
  location   text,
  agenda     text
);

create table if not exists messages (
  id         text primary key default gen_random_uuid()::text,
  channel_id text not null references channels(id) on delete cascade,
  author_id  text not null references members(id),
  body       text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists attachments (
  id         text primary key default gen_random_uuid()::text,
  owner_type text not null check (owner_type in ('project','meeting','message')),
  owner_id   text not null,
  project_id text references projects(id) on delete cascade,
  kind       text not null check (kind in ('file','image','link')),
  name       text not null,
  url        text not null,
  created_at timestamptz not null default now()
);

create table if not exists notes (
  id         text primary key default gen_random_uuid()::text,
  member_id  text not null references members(id) on delete cascade,
  title      text not null default '',
  body       text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists idx_meetings_starts on meetings(starts_at);
create index if not exists idx_messages_channel on messages(channel_id, created_at);
create index if not exists idx_attachments_project on attachments(project_id);
create index if not exists idx_attachments_owner on attachments(owner_type, owner_id);
create index if not exists idx_notes_member on notes(member_id);

-- 실시간(채팅)용: messages 테이블을 realtime publication 에 추가
alter publication supabase_realtime add table messages;

-- ── RLS: 공용 게이트 전제하에 anon 전체 허용 ──────────────────────────
do $$
declare t text;
begin
  foreach t in array array['members','projects','channels','meetings','messages','attachments','notes']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists anon_all on %I', t);
    execute format(
      'create policy anon_all on %I for all to anon, authenticated using (true) with check (true)', t);
  end loop;
end $$;
