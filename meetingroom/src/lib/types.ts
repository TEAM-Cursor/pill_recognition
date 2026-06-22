// 데이터 모델 — 디스코드 구조를 그대로 옮긴 것.
//  · 카테고리 "참여 중인 해커톤"의 포럼 1개  = Project 1개
//  · 포럼 글 "[회의] 06/23"                  = Meeting (달력에 뜸)
//  · 자유-채팅 / 자유-토론 같은 채널          = Channel (프로젝트당 여러 개 가능)
//  · 채널 안의 글                            = Message
//  · .hwp / 이미지 / 링크 첨부               = Attachment
//  · 개인 메모장                             = Note (본인만)

export type Member = {
  id: string;
  name: string;
  color: string; // 아바타/프로젝트 색
};

export type ProjectStatus = "active" | "archived";

export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  color: string;
  /** 대회 마감/응시일 등 (선택) */
  deadline: string | null; // ISO date
  /** 공고 링크 등 (선택) */
  link: string | null;
  /** 정렬용 */
  sort: number;
};

export type ChannelKind = "chat" | "forum";

export type Channel = {
  id: string;
  /** null = 공통(일반) 채널, 값 있으면 해당 프로젝트 전용 */
  project_id: string | null;
  name: string;
  kind: ChannelKind;
  sort: number;
};

export type Meeting = {
  id: string;
  project_id: string;
  title: string;
  starts_at: string; // ISO datetime
  ends_at: string | null;
  location: string | null; // 장소 또는 화상링크
  agenda: string | null; // 안건/회의내용 (마크다운 가능)
};

export type Message = {
  id: string;
  channel_id: string;
  author_id: string;
  body: string;
  created_at: string;
};

export type AttachmentKind = "file" | "image" | "link";

/** 첨부는 메시지·회의·프로젝트 어디에나 붙을 수 있음 */
export type AttachmentOwner = "project" | "meeting" | "message";

export type Attachment = {
  id: string;
  owner_type: AttachmentOwner;
  owner_id: string;
  project_id: string | null; // 자료 탭 묶음용
  kind: AttachmentKind;
  name: string;
  url: string;
  created_at: string;
};

export type Note = {
  id: string;
  member_id: string;
  title: string;
  body: string;
  updated_at: string;
};
