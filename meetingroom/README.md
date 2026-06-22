# 🗓️ MeetingRoom — Team-Seuk 협업 허브

해커톤 팀이 디스코드 대신 쓰는 **회의 일정 · 프로젝트별 대화방 · 자료/링크 첨부 · 개인 메모** 웹앱.
모바일 반응형이고, **사이트 공용 비밀번호를 아는 사람만** 입장할 수 있습니다.

> 디스코드의 "참여 중인 해커톤" 포럼 구조를 그대로 옮긴 것입니다:
> 포럼 1개 = **프로젝트**, `[회의] 06/23` 글 = **캘린더의 회의**, 채널 = **대화방**, 첨부 = **자료**.

## ✨ 기능
- **📅 통합 캘린더** — 모든 프로젝트 회의를 한 달력에서. 프로젝트별 색 + 필터 칩으로 개별/조합 보기. 모바일에선 아젠다 리스트.
- **프로젝트별 대화방 여러 개** — 한 프로젝트에 `일반`·`개발`·`서류-제출` 등 채널을 자유롭게.
- **실시간 채팅** — Supabase Realtime. 파일·이미지·링크 첨부.
- **자료 탭** — 프로젝트마다 서류(.hwp)·이미지·링크 모아두기.
- **개인 메모** — 나만 보이는 메모장.
- **공용 비번 게이트 + 이름 선택** — 입장 후 이름을 고르면 메모/메시지가 그 이름으로 저장.

## 🚀 빠른 시작 (설정 0초 — 데모 모드)
```bash
npm install
npm run dev      # http://localhost:5174
```
환경변수가 없으면 자동으로 **데모 모드**(브라우저 `localStorage`)로 동작합니다.
디스코드에서 옮겨온 실제 프로젝트·회의가 미리 들어가 있어 바로 둘러볼 수 있어요.
기본 입장 비번: `teamseuk` (아무 이름이나 선택).

> 데모 모드는 **내 브라우저에만** 저장됩니다(여러 명 공유 ✗, 실시간 ✗). 팀 공유는 아래 Supabase 설정.

## 🌐 팀 공유 모드 (Supabase)
1. [supabase.com](https://supabase.com) → **New project** 생성.
2. **SQL Editor** 에서 `supabase/schema.sql` → 그 다음 `supabase/seed.sql` 실행.
3. **Storage** 에서 `attachments` 라는 **public 버킷** 생성(파일/이미지 업로드용).
4. **Project Settings → API** 에서 `Project URL` 과 `anon public` 키 복사.
5. `.env.example` → `.env` 복사 후 채우기:
   ```
   VITE_SITE_PASSWORD=원하는_공용_비번
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
6. `npm run dev` → 이제 팀원 모두가 같은 데이터를 실시간으로 공유합니다.

### 배포
- 프론트: **Vercel/Netlify** 에 연결(빌드 `npm run build`, 출력 `dist`). 환경변수는 대시보드에 동일하게 입력.
- 데이터: Supabase 클라우드. 둘 다 무료 티어로 팀 규모 충분.

## 🔐 보안 모델 (읽어주세요)
- 접근은 **공용 비밀번호 한 개**로 막습니다(소규모 신뢰 팀 전제). 비번은 빌드에 포함되니 *공개 저장소엔 진짜 비번을 넣지 마세요* — 배포 환경변수로만.
- Supabase 모드의 RLS 는 게이트를 전제로 **anon 전체 허용**입니다. URL+anon키가 새면 누구나 접근 가능.
- 더 강한 보안이 필요하면 **Supabase Auth(개인 이메일+비번)** + 사용자별 RLS 로 교체하세요. 데이터 모델은 그대로 두고 인증 계층만 바꾸면 됩니다.

## 🧱 기술 스택 / 구조
- **React + TypeScript + Vite** (Team-Seuk/Yaksok 과 동일 계열).
- **Supabase** — Postgres · Auth(선택) · Realtime · Storage.
- 데이터 접근은 `src/lib/db.ts` 한 인터페이스로 추상화 → 백엔드(`db.mock` / `db.supabase`)를 환경변수로 자동 전환.

```
src/
  lib/        types · db(추상화) · db.mock · db.supabase · supabase · session · seed · date
  state.tsx   전역 데이터(멤버·프로젝트·채널·회의) 컨텍스트
  components/ Gate · Sidebar · Avatar · MeetingModal · AttachmentChip
  pages/      CalendarPage · ProjectPage · ChannelPage · NotesPage
supabase/     schema.sql · seed.sql
```

## 📜 스크립트
| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 타입체크 + 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
