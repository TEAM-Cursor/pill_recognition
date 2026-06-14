import type { ChatRecord, Message, PillInfo, Profile, SummaryDoc } from './types';

/**
 * M0 더미 데이터 / 목 서비스.
 * 실연동 시 이 파일의 함수들이 실제 호출로 바뀐다:
 *   TODO(M2): Claude 비전으로 사진 → 각인/색/모양/분할선 속성 추출
 *   TODO(M3): 추출 속성으로 "의약품 낱알식별 정보" API 조회 → 품목코드
 *   TODO(M3): 품목코드로 "DUR 품목정보" / "e약은요" API 조회
 *   TODO(M4): Claude로 개인정보 + 현재 시각 반영한 안내·요약 생성
 */

const SAMPLE_PILLS: PillInfo[] = [
  { name: '타이레놀정 500mg', ingredient: '아세트아미노펜 500mg', company: '한국얀센', shape: '장방형', color: '흰색', imprint: 'TYLENOL 500' },
  { name: '게보린정', ingredient: '아세트아미노펜·이소프로필안티피린·카페인', company: '삼진제약', shape: '원형', color: '연분홍', imprint: 'GBR' },
  { name: '이지엔6프로연질캡슐', ingredient: '덱시부프로펜 300mg', company: '대웅제약', shape: '타원형', color: '빨강', imprint: '-' },
  { name: '베아제정', ingredient: '소화효소복합제', company: '대웅제약', shape: '원형', color: '노랑', imprint: 'BEARSE' },
];

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function timeLabel(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}

export function pickPill(): PillInfo {
  return SAMPLE_PILLS[Math.floor(Math.random() * SAMPLE_PILLS.length)];
}

function sexLabel(s: Profile['sex']): string {
  return s === 'female' ? '여성' : s === 'male' ? '남성' : '';
}

/** 개인정보 + 현재 시각을 반영한 첫 안내 + 요약 v1 */
export function buildIntro(pill: PillInfo, profile: Profile, now: Date): { message: string; summary: SummaryDoc } {
  const hour = now.getHours();
  const age = profile.age.trim() ? `${profile.age}세` : '';
  const sex = sexLabel(profile.sex);
  const who = [age, sex].filter(Boolean).join(' ');

  const timeNote =
    hour >= 20 || hour < 5
      ? `지금 ${hour}시예요. 공복에 드시면 다음날 아침 속쓰림이 있을 수 있으니 물과 함께 드세요.`
      : `지금 ${hour}시예요. 식사와 함께 또는 식후에 드시면 좋아요.`;

  const lines = [
    `${pill.name} (${pill.ingredient})로 확인했어요.`,
    `${who ? who + ' 기준, ' : ''}1회 1~2정 / 4~6시간 간격으로, 하루 최대 4g(아세트아미노펜 기준)을 넘기지 마세요.`,
    `식후 30분 복용을 권장해요.`,
    timeNote,
  ];
  if (profile.pregnancy !== 'none') {
    lines.push('임신/수유 중이라고 입력하셨어요. 복용 전 의사·약사와 꼭 상의하세요.');
  }
  if (profile.allergies.trim()) {
    lines.push(`입력하신 알레르기(${profile.allergies.trim()})와의 교차반응 가능성도 살펴보세요.`);
  }

  const summary: SummaryDoc = {
    version: 1,
    title: `${pill.name} 요약 v1`,
    bullets: [
      `성분: ${pill.ingredient}`,
      '용법: 1회 1~2정, 4~6시간 간격, 식후 30분',
      '최대: 하루 4g 이하',
      timeNote,
      profile.pregnancy !== 'none' ? '임신/수유 시 전문가 상담 필요' : `대상: ${who || '입력 정보 기준'}`,
    ],
    createdLabel: timeLabel(now),
  };
  return { message: lines.join('\n\n'), summary };
}

const QA: { keys: string[]; answer: string; bullet: string }[] = [
  {
    keys: ['술', '음주', '알코올', '맥주', '소주', '와인'],
    answer: '음주와 함께 복용하면 간 손상 위험이 커져요. 복용 전후로 음주는 피하는 게 좋아요.',
    bullet: '음주 병행 금지 (간 부담)',
  },
  {
    keys: ['저녁', '밤', '자기', '취침', '수면'],
    answer: '저녁에 드셔도 되지만, 공복이라면 다음날 아침 속쓰림이 있을 수 있어요. 물과 함께 드세요.',
    bullet: '저녁 공복 복용 시 속쓰림 주의',
  },
  {
    keys: ['임신', '수유', '모유'],
    answer: '아세트아미노펜은 비교적 안전한 편이지만, 임신·수유 중에는 용량과 기간을 의사와 상의하세요.',
    bullet: '임신/수유: 전문가 상담',
  },
  {
    keys: ['부작용', '이상', '발진', '두드러기', '간'],
    answer: '드물게 발진·간수치 상승이 나타날 수 있어요. 이상 증상이 보이면 복용을 멈추고 진료를 받으세요.',
    bullet: '이상 증상 시 중단·진료',
  },
  {
    keys: ['얼마', '몇', '간격', '하루', '용량'],
    answer: '1회 1~2정, 4~6시간 간격이며 하루 최대 4g을 넘기지 마세요. 다른 감기약에도 같은 성분이 들어있을 수 있으니 중복에 주의하세요.',
    bullet: '성분 중복 복용 주의',
  },
];

/** 후속 질문에 대한 답변 + 누적 요약 다음 버전 */
export function buildReply(
  question: string,
  prevSummary: SummaryDoc,
  now: Date,
): { message: string; summary: SummaryDoc } {
  const hit = QA.find((x) => x.keys.some((k) => question.includes(k)));
  const answer = hit
    ? hit.answer
    : '입력하신 정보 기준으로는 특별한 추가 주의사항은 없어요. 더 궁금한 점이 있으면 물어보세요.';
  const bullet = hit ? hit.bullet : `Q. ${question.slice(0, 24)} → 추가 주의사항 없음`;
  const nextVersion = prevSummary.version + 1;
  const summary: SummaryDoc = {
    version: nextVersion,
    title: prevSummary.title.replace(/v\d+$/, `v${nextVersion}`),
    bullets: [...prevSummary.bullets, bullet],
    createdLabel: timeLabel(now),
  };
  return { message: answer, summary };
}

/** 증상별 약 추천 (OTC 한정 더미) */
export function mockRecommend(symptom: string): { name: string; note: string }[] {
  const s = symptom.trim();
  if (/두통|머리|편두통/.test(s)) {
    return [
      { name: '타이레놀정 500mg', note: '아세트아미노펜 · 공복에도 비교적 부담 적음' },
      { name: '이지엔6프로', note: '덱시부프로펜 · 소염 효과, 위장 장애 시 식후' },
    ];
  }
  if (/콧물|코막힘|코|비염/.test(s)) {
    return [
      { name: '액티피드정', note: '항히스타민+비충혈제거 · 졸음 유발 가능' },
      { name: '코메키나캡슐', note: '코막힘 완화 · 운전 전 주의' },
    ];
  }
  if (/소화|체|더부룩|속/.test(s)) {
    return [
      { name: '베아제정', note: '소화효소제 · 식후 복용' },
      { name: '겔포스엠', note: '제산제 · 속쓰림 동반 시' },
    ];
  }
  if (/기침|가래|목/.test(s)) {
    return [{ name: '코푸시럽', note: '진해거담 · 졸음 유발 가능' }];
  }
  return [{ name: '약사 상담 권장', note: `'${s}' 증상은 약사와 직접 상담을 권해요.` }];
}

/** 알약사전 초기 더미 기록 */
export function seedRecords(): ChatRecord[] {
  const mk = (
    id: string,
    pill: PillInfo,
    daysAgo: number,
    msgs: Message[],
    summaries: SummaryDoc[],
  ): ChatRecord => ({
    id,
    pill,
    createdAt: Date.now() - daysAgo * 86400000,
    messages: msgs,
    summaries,
  });

  return [
    mk(
      'seed_tylenol',
      SAMPLE_PILLS[0],
      0,
      [
        {
          id: 'm1',
          role: 'assistant',
          text: '타이레놀정 500mg로 확인했어요.\n\n1회 1~2정 / 4~6시간 간격, 하루 최대 4g을 넘기지 마세요.\n\n식후 30분 복용을 권장해요.',
          summaryVersion: 1,
        },
        { id: 'm2', role: 'user', text: '저녁에 먹어도 되나요?' },
        {
          id: 'm3',
          role: 'assistant',
          text: '저녁에 드셔도 되지만, 공복이라면 다음날 아침 속쓰림이 있을 수 있어요. 물과 함께 드세요.',
          summaryVersion: 2,
        },
      ],
      [
        {
          version: 1,
          title: '타이레놀정 500mg 요약 v1',
          bullets: ['성분: 아세트아미노펜 500mg', '용법: 1회 1~2정, 4~6시간 간격, 식후 30분', '최대: 하루 4g 이하'],
          createdLabel: '09:12',
        },
        {
          version: 2,
          title: '타이레놀정 500mg 요약 v2',
          bullets: [
            '성분: 아세트아미노펜 500mg',
            '용법: 1회 1~2정, 4~6시간 간격, 식후 30분',
            '최대: 하루 4g 이하',
            '저녁 공복 복용 시 속쓰림 주의',
          ],
          createdLabel: '09:14',
        },
      ],
    ),
    mk(
      'seed_gebrin',
      SAMPLE_PILLS[1],
      3,
      [
        {
          id: 'g1',
          role: 'assistant',
          text: '게보린정으로 확인했어요. 카페인이 들어 있어 늦은 밤 복용 시 수면을 방해할 수 있어요.',
          summaryVersion: 1,
        },
      ],
      [
        {
          version: 1,
          title: '게보린정 요약 v1',
          bullets: ['성분: 아세트아미노펜·이소프로필안티피린·카페인', '카페인 함유 → 야간 복용 시 수면 방해 가능'],
          createdLabel: '21:40',
        },
      ],
    ),
  ];
}
