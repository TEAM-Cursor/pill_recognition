-- MeetingRoom — 초기 데이터 (디스코드 서버에서 옮겨온 것)
-- schema.sql 실행 후, 같은 SQL Editor 에서 Run.

insert into members (id, name, color) values
  ('m_jaewoo','이재우','#f08c5a'),
  ('m_woojung','이우정','#5a9ef0'),
  ('m_soyeon','박소연','#c45af0'),
  ('m_sutaek','진수택','#4cc4a8')
on conflict (id) do nothing;

insert into projects (id, name, status, color, deadline, link, sort) values
  ('p_yaksok','0628 · 알약 (충청북도 공공데이터)','active','#4cc4a8','2026-06-28',null,1),
  ('p_geoul','0630 · 거울 ICT 스마트 디바이스','active','#5a9ef0','2026-06-30',null,2),
  ('p_jobkorea','0625 · 잡코리아 바이브톤','active','#f0b35a','2026-07-04',null,3),
  ('p_culture','0626 · 제4회 문화체육관광 AI 공모전','active','#c45af0','2026-06-26','https://www.culture.go.kr/digicon/pages/contest_1',4),
  ('p_dabada','0 · 다바다 (종료)','archived','#7a7f8c',null,null,99)
on conflict (id) do nothing;

insert into channels (id, project_id, name, kind, sort) values
  ('c_notice',null,'공지사항','forum',1),
  ('c_free',null,'자유-채팅','chat',2),
  ('c_debate',null,'자유-토론','forum',3),
  ('c_info',null,'유용한-정보','chat',4),
  ('c_hackinfo',null,'해커톤-정보','forum',5),
  ('c_news',null,'뉴스','chat',6),
  ('c_yaksok_general','p_yaksok','일반','chat',1),
  ('c_yaksok_dev','p_yaksok','개발','chat',2),
  ('c_yaksok_docs','p_yaksok','서류-제출','forum',3),
  ('c_geoul_general','p_geoul','일반','chat',1),
  ('c_jobkorea_general','p_jobkorea','일반','chat',1),
  ('c_culture_general','p_culture','일반','chat',1)
on conflict (id) do nothing;

insert into meetings (id, project_id, title, starts_at, ends_at, location, agenda) values
  ('mt_y_0623','p_yaksok','06/23(화) 회의','2026-06-23T20:00:00+09','2026-06-23T21:00:00+09',null,'1. 알약 어플의 ''임팩트'' 아이디어 하나씩 생각해오기'),
  ('mt_y_0622','p_yaksok','06/22 회의','2026-06-22T19:00:00+09',null,null,'회의 내용 정리'),
  ('mt_y_0618','p_yaksok','06/18(목) 회의','2026-06-18T20:00:00+09',null,null,'알약 앱 ERD 완성 · 역할분배 · 계획서 구체화'),
  ('mt_y_0617','p_yaksok','06/17(수) 회의','2026-06-17T20:00:00+09',null,null,null),
  ('mt_g_0618','p_geoul','06/18(목) 회의','2026-06-18T21:00:00+09',null,null,'주제: 1. 혁신성 — 박소연'),
  ('mt_g_0615','p_geoul','06/15(월) 회의','2026-06-15T20:00:00+09',null,null,'주제: 1. 아이디어의 필요성'),
  ('mt_g_0610','p_geoul','06/10(수) 신청서 모의심사','2026-06-10T20:00:00+09',null,null,'해커톤 예선 공식 평가기준 4가지로 각자 심사'),
  ('mt_jk_0704','p_jobkorea','응시일 — 바이브톤 본선','2026-07-04T09:30:00+09','2026-07-04T19:00:00+09','온라인','주제: 팀장님이 보면 한숨 나올 서비스 만들기')
on conflict (id) do nothing;

insert into attachments (id, owner_type, owner_id, project_id, kind, name, url) values
  ('att1','project','p_yaksok','p_yaksok','file','제품_및_서비스_개발_사업계획서_팀명.hwp','#'),
  ('att2','project','p_yaksok','p_yaksok','file','아이디어_기획_제안서_팀명.hwp','#'),
  ('att3','project','p_yaksok','p_yaksok','link','공공데이터포털 data.go.kr','https://www.data.go.kr/')
on conflict (id) do nothing;
