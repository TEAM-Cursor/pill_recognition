// 디스코드 서버에서 그대로 옮겨온 초기 데이터 (데모 모드 + Supabase seed.sql 의 원본).
// 실제 회의 글/날짜를 반영해 처음부터 "살아있는" 화면이 되도록 함.
import type {
  Attachment,
  Channel,
  Meeting,
  Member,
  Message,
  Note,
  Project,
} from "./types";

export const MEMBERS: Member[] = [
  { id: "m_jaewoo", name: "이재우", color: "#f08c5a" },
  { id: "m_woojung", name: "이우정", color: "#5a9ef0" },
  { id: "m_soyeon", name: "박소연", color: "#c45af0" },
  { id: "m_sutaek", name: "진수택", color: "#4cc4a8" },
];

export const PROJECTS: Project[] = [
  {
    id: "p_yaksok",
    name: "0628 · 알약 (충청북도 공공데이터)",
    status: "active",
    color: "#4cc4a8",
    deadline: "2026-06-28",
    link: null,
    sort: 1,
  },
  {
    id: "p_geoul",
    name: "0630 · 거울 ICT 스마트 디바이스",
    status: "active",
    color: "#5a9ef0",
    deadline: "2026-06-30",
    link: null,
    sort: 2,
  },
  {
    id: "p_jobkorea",
    name: "0625 · 잡코리아 바이브톤",
    status: "active",
    color: "#f0b35a",
    deadline: "2026-07-04",
    link: null,
    sort: 3,
  },
  {
    id: "p_culture",
    name: "0626 · 제4회 문화체육관광 AI 공모전",
    status: "active",
    color: "#c45af0",
    deadline: "2026-06-26",
    link: "https://www.culture.go.kr/digicon/pages/contest_1",
    sort: 4,
  },
  {
    id: "p_dabada",
    name: "0 · 다바다 (종료)",
    status: "archived",
    color: "#7a7f8c",
    deadline: null,
    link: null,
    sort: 99,
  },
];

export const CHANNELS: Channel[] = [
  // 공통(일반) 채널 — project_id 없음
  { id: "c_notice", project_id: null, name: "공지사항", kind: "forum", sort: 1 },
  { id: "c_free", project_id: null, name: "자유-채팅", kind: "chat", sort: 2 },
  { id: "c_debate", project_id: null, name: "자유-토론", kind: "forum", sort: 3 },
  { id: "c_info", project_id: null, name: "유용한-정보", kind: "chat", sort: 4 },
  { id: "c_hackinfo", project_id: null, name: "해커톤-정보", kind: "forum", sort: 5 },
  { id: "c_news", project_id: null, name: "뉴스", kind: "chat", sort: 6 },
  // 프로젝트 전용 채널 — 한 프로젝트에 여러 대화방
  { id: "c_yaksok_general", project_id: "p_yaksok", name: "일반", kind: "chat", sort: 1 },
  { id: "c_yaksok_dev", project_id: "p_yaksok", name: "개발", kind: "chat", sort: 2 },
  { id: "c_yaksok_docs", project_id: "p_yaksok", name: "서류-제출", kind: "forum", sort: 3 },
  { id: "c_geoul_general", project_id: "p_geoul", name: "일반", kind: "chat", sort: 1 },
  { id: "c_jobkorea_general", project_id: "p_jobkorea", name: "일반", kind: "chat", sort: 1 },
  { id: "c_culture_general", project_id: "p_culture", name: "일반", kind: "chat", sort: 1 },
];

export const MEETINGS: Meeting[] = [
  {
    id: "mt_y_0623",
    project_id: "p_yaksok",
    title: "06/23(화) 회의",
    starts_at: "2026-06-23T20:00:00",
    ends_at: "2026-06-23T21:00:00",
    location: null,
    agenda: "1. 알약 어플의 '임팩트' 아이디어 하나씩 생각해오기",
  },
  {
    id: "mt_y_0622",
    project_id: "p_yaksok",
    title: "06/22 회의",
    starts_at: "2026-06-22T19:00:00",
    ends_at: null,
    location: null,
    agenda: "회의 내용 정리",
  },
  {
    id: "mt_y_0618",
    project_id: "p_yaksok",
    title: "06/18(목) 회의",
    starts_at: "2026-06-18T20:00:00",
    ends_at: null,
    location: null,
    agenda: "알약 앱 ERD 완성 · ERD에 따라 역할분배 · 계획서 구체화",
  },
  {
    id: "mt_y_0617",
    project_id: "p_yaksok",
    title: "06/17(수) 회의",
    starts_at: "2026-06-17T20:00:00",
    ends_at: null,
    location: null,
    agenda: null,
  },
  {
    id: "mt_g_0618",
    project_id: "p_geoul",
    title: "06/18(목) 회의",
    starts_at: "2026-06-18T21:00:00",
    ends_at: null,
    location: null,
    agenda: "주제: 1. 혁신성 — 박소연",
  },
  {
    id: "mt_g_0615",
    project_id: "p_geoul",
    title: "06/15(월) 회의",
    starts_at: "2026-06-15T20:00:00",
    ends_at: null,
    location: null,
    agenda: "주제: 1. 아이디어의 필요성",
  },
  {
    id: "mt_g_0610",
    project_id: "p_geoul",
    title: "06/10(수) 신청서 모의심사",
    starts_at: "2026-06-10T20:00:00",
    ends_at: null,
    location: null,
    agenda: "월요일에 가져온 신청서를 각자 심사. 해커톤 예선 공식 평가기준 4가지로.",
  },
  {
    id: "mt_jk_0704",
    project_id: "p_jobkorea",
    title: "응시일 — 바이브톤 본선",
    starts_at: "2026-07-04T09:30:00",
    ends_at: "2026-07-04T19:00:00",
    location: "온라인",
    agenda: "주제: 팀장님이 보면 한숨 나올 서비스 만들기",
  },
];

export const MESSAGES: Message[] = [
  {
    id: "msg1",
    channel_id: "c_yaksok_general",
    author_id: "m_jaewoo",
    body: "오늘 회의 안건은 ERD 마무리랑 역할 분배입니다.",
    created_at: "2026-06-18T19:50:00",
  },
  {
    id: "msg2",
    channel_id: "c_yaksok_general",
    author_id: "m_woojung",
    body: "넵 ERD 초안 자료 탭에 올려둘게요.",
    created_at: "2026-06-18T19:52:00",
  },
  {
    id: "msg3",
    channel_id: "c_free",
    author_id: "m_soyeon",
    body: "다들 오늘도 고생 많으셨습니다 🙌",
    created_at: "2026-06-21T22:00:00",
  },
];

export const ATTACHMENTS: Attachment[] = [
  {
    id: "att1",
    owner_type: "project",
    owner_id: "p_yaksok",
    project_id: "p_yaksok",
    kind: "file",
    name: "제품_및_서비스_개발_사업계획서_팀명.hwp",
    url: "#",
    created_at: "2026-06-20T10:00:00",
  },
  {
    id: "att2",
    owner_type: "project",
    owner_id: "p_yaksok",
    project_id: "p_yaksok",
    kind: "file",
    name: "아이디어_기획_제안서_팀명.hwp",
    url: "#",
    created_at: "2026-06-19T10:00:00",
  },
  {
    id: "att3",
    owner_type: "project",
    owner_id: "p_yaksok",
    project_id: "p_yaksok",
    kind: "link",
    name: "공공데이터포털 data.go.kr",
    url: "https://www.data.go.kr/",
    created_at: "2026-06-17T10:00:00",
  },
];

export const NOTES: Note[] = [
  {
    id: "n1",
    member_id: "m_jaewoo",
    title: "내 할 일",
    body: "- 사업계획서 6번 항목 채우기\n- 알약 임팩트 아이디어 3개\n- 잡코리아 응시일 7/4 캘린더 확인",
    updated_at: "2026-06-22T09:00:00",
  },
];
