export type Sex = 'male' | 'female' | 'other';
export type Pregnancy = 'none' | 'pregnant' | 'nursing';

export type Profile = {
  age: string;
  sex: Sex;
  pregnancy: Pregnancy;
  meds: string;
  allergies: string;
};

export type Role = 'user' | 'assistant';

export type Message = {
  id: string;
  role: Role;
  text: string;
  // assistant 메시지는 그 시점에 생성된 요약 문서 버전을 함께 가진다 (요약 버튼 → 해당 버전)
  summaryVersion?: number;
};

export type SummaryDoc = {
  version: number;
  title: string;
  bullets: string[];
  createdLabel: string;
};

// 비전→속성→낱알식별 API 파이프라인의 산출물 (M0는 더미)
export type PillInfo = {
  name: string;
  ingredient: string;
  company: string;
  shape: string;
  color: string;
  imprint: string;
};

export type ChatRecord = {
  id: string;
  pill: PillInfo;
  createdAt: number;
  messages: Message[];
  summaries: SummaryDoc[];
};
