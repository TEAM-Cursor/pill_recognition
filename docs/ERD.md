# pill_recognition — ERD (데이터 모델)

> 데이터 모델의 단일 출처. 목표/결정 맥락은 [PLAN.md](../PLAN.md), 문서 규칙은 [CONVENTIONS.md](../CONVENTIONS.md).
> **상태**: v1 확정 (2026-06-17) · 대상 DB **PostgreSQL**.
> **단, 프로토타입 단계에선 서버/DB를 실제 구현하지 않는다** — 프론트 임시 저장(localStorage 등)으로 진행하고, 추후 백엔드 영속화 시 이 스키마대로 구현한다.

## 결정 요약

- **계정**: `users`(이메일+비밀번호) 스키마는 둔다. **프로토타입에선 인증 미구현** — 시드 dev 유저 1명에 모든 row를 연결. 로그인은 나중에 얹는다.
- **건강정보**: 목표 스키마는 서버 DB(`health_profiles`/`medications`/`allergies`). 프로토타입은 위 방침대로 임시 저장. (PLAN 초기안의 localStorage → 서버 DB로 방향 확정, 단 구현은 추후)
- **촬영 이미지**: **서버에 저장하지 않는다.** 비전 LLM이 추출한 속성(`scans.vision_attrs`)만 보관. (`pills.image_url`은 식약처가 제공하는 약 사진으로, 우리 촬영본과 무관.)
- **약 데이터**: 식약처 3종 API(낱알식별·DUR·e약은요) 결과를 `pills`에 품목코드(`item_seq`) 기준으로 캐시.

## 다이어그램

```mermaid
erDiagram
  users ||--o| health_profiles : has
  users ||--o{ scans : scans
  users ||--o{ conversations : owns
  users ||--o{ symptom_queries : asks
  health_profiles ||--o{ medications : takes
  health_profiles ||--o{ allergies : has
  pills ||--o{ scans : matched_by
  pills ||--o{ conversations : about
  pills ||--o{ medications : ref
  scans ||--o| conversations : creates
  conversations ||--o{ messages : has
  conversations ||--o{ summaries : has

  users {
    bigserial id PK
    text email UK
    text password_hash
    text nickname
    timestamptz created_at
  }
  health_profiles {
    bigserial id PK
    bigint user_id FK
    int birth_year
    text sex "M|F|other"
    boolean is_pregnant
    boolean is_breastfeeding
    timestamptz updated_at
  }
  medications {
    bigserial id PK
    bigint profile_id FK
    text name
    text pill_item_seq FK "nullable"
    text memo
    timestamptz created_at
  }
  allergies {
    bigserial id PK
    bigint profile_id FK
    text name
    text memo
    timestamptz created_at
  }
  pills {
    text item_seq PK "품목기준코드"
    text item_name
    text entp_name
    boolean is_otc
    text shape
    text color
    text mark_code "각인"
    text form_line "분할선"
    text image_url "식약처 제공 사진"
    text efcy "효능"
    text use_method "용법"
    text caution "주의/DUR"
    jsonb raw_json
    timestamptz fetched_at
  }
  scans {
    bigserial id PK
    bigint user_id FK
    jsonb vision_attrs "각인/색/모양/분할선"
    text matched_item_seq FK "nullable"
    real confidence
    text status "matched|ambiguous|failed"
    timestamptz created_at
  }
  conversations {
    bigserial id PK
    bigint user_id FK
    text pill_item_seq FK "nullable"
    bigint scan_id FK "nullable"
    text title
    timestamptz created_at
    timestamptz updated_at
  }
  messages {
    bigserial id PK
    bigint conversation_id FK
    text role "user|assistant|system"
    text content
    timestamptz created_at
  }
  summaries {
    bigserial id PK
    bigint conversation_id FK
    int version "v1->v2..."
    text content
    timestamptz created_at
  }
  symptom_queries {
    bigserial id PK
    bigint user_id FK
    text symptom_text
    jsonb result "추천 OTC 목록"
    timestamptz created_at
  }
```

## 테이블 정의 (DDL 스타일)

```sql
users
  id            bigserial PK
  email         text UNIQUE NOT NULL
  password_hash text NOT NULL            -- 프로토타입: 미사용(시드 dev 유저)
  nickname      text
  created_at    timestamptz DEFAULT now()

health_profiles                          -- users 1:1
  id               bigserial PK
  user_id          bigint FK->users UNIQUE NOT NULL
  birth_year       int
  sex              text                  -- 'M' | 'F' | 'other'
  is_pregnant      boolean DEFAULT false
  is_breastfeeding boolean DEFAULT false
  updated_at       timestamptz DEFAULT now()

medications                              -- health_profiles 1:N (복용약)
  id            bigserial PK
  profile_id    bigint FK->health_profiles NOT NULL
  name          text NOT NULL
  pill_item_seq text FK?->pills          -- 식별되면 연결
  memo          text
  created_at    timestamptz DEFAULT now()

allergies                                -- health_profiles 1:N (알레르기)
  id          bigserial PK
  profile_id  bigint FK->health_profiles NOT NULL
  name        text NOT NULL
  memo        text
  created_at  timestamptz DEFAULT now()

pills                                    -- 식약처 3종 API 캐시
  item_seq    text PK                    -- 품목기준코드
  item_name   text NOT NULL
  entp_name   text                       -- 업체
  is_otc      boolean                    -- OTC/ETC
  shape       text
  color       text
  mark_code   text                       -- 각인
  form_line   text                       -- 분할선
  image_url   text                       -- 식약처 제공 약 사진(우리 촬영본 아님)
  efcy        text                       -- e약은요 효능
  use_method  text                       -- 용법
  caution     text                       -- 주의(DUR 포함)
  raw_json    jsonb
  fetched_at  timestamptz DEFAULT now()

scans                                    -- 인식 (촬영본 미저장)
  id               bigserial PK
  user_id          bigint FK->users NOT NULL
  vision_attrs     jsonb                 -- 비전 LLM 추출 결과
  matched_item_seq text FK?->pills
  confidence       real
  status           text                  -- 'matched' | 'ambiguous' | 'failed'
  created_at       timestamptz DEFAULT now()

conversations                            -- 알약사전 1항목
  id            bigserial PK
  user_id       bigint FK->users NOT NULL
  pill_item_seq text FK?->pills
  scan_id       bigint FK?->scans        -- 인식에서 자동 생성 시
  title         text
  created_at    timestamptz DEFAULT now()
  updated_at    timestamptz DEFAULT now()

messages                                 -- conversations 1:N
  id              bigserial PK
  conversation_id bigint FK->conversations NOT NULL
  role            text NOT NULL          -- 'user' | 'assistant' | 'system'
  content         text NOT NULL
  created_at      timestamptz DEFAULT now()

summaries                                -- conversations 1:N, 누적 버전
  id              bigserial PK
  conversation_id bigint FK->conversations NOT NULL
  version         int NOT NULL
  content         text NOT NULL
  created_at      timestamptz DEFAULT now()
  UNIQUE(conversation_id, version)

symptom_queries                          -- (선택) 증상별 추천 로그
  id           bigserial PK
  user_id      bigint FK->users NOT NULL
  symptom_text text NOT NULL
  result       jsonb                     -- 추천 OTC 목록
  created_at   timestamptz DEFAULT now()
```

## 관계 요약

| 관계 | 카디널리티 | 비고 |
|---|---|---|
| users — health_profiles | 1 : 0..1 | 온보딩 완료 시 1개 |
| health_profiles — medications | 1 : N | 복용약 목록 |
| health_profiles — allergies | 1 : N | 알레르기 목록 |
| users — scans | 1 : N | 인식 기록 |
| users — conversations | 1 : N | 알약사전 |
| users — symptom_queries | 1 : N | (선택) |
| scans — conversations | 1 : 0..1 | 인식 성공 시 대화 자동 생성 |
| conversations — messages | 1 : N | 대화 메시지 |
| conversations — summaries | 1 : N | 누적 요약 버전 |
| pills — scans | 1 : N | `matched_item_seq` (nullable) |
| pills — conversations | 1 : N | `pill_item_seq` (nullable) |
| pills — medications | 1 : N | `pill_item_seq` (nullable, 선택 연결) |

## 설계 메모

- **인식 실패 허용**: `scans.status`로 `matched|ambiguous|failed` 구분. 실패해도 `matched_item_seq`는 null로 row 보존 → 재시도/분석.
- **대화 자동 생성**: PLAN의 "인식 성공 대화는 알약사전에 자동 저장" → `scan` 1건이 `conversation` 1개를 생성(`scan_id`). 대화는 인식 없이도 존재 가능하게 nullable.
- **요약 누적 버전**: `summaries.version`은 conversation별 1부터 증가, `UNIQUE(conversation_id, version)`. 내용은 누적형(v3 = v1+v2+신규)이라 매 버전이 전체 문서.
- **pills 캐시**: 외부 API 원본은 `raw_json`(jsonb)에 통째로 보관, 자주 쓰는 필드만 컬럼으로 승격. `fetched_at`으로 갱신 시점 추적.
- **증상별 추천**: `symptom_queries`는 추천 이력이 필요할 때만. 단순 1회성 호출이면 테이블 없이 진행 가능 → v1에선 선택.
