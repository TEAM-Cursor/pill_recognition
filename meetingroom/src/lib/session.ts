// 접근 제어 — 공용 비밀번호 게이트 + 이름(멤버) 선택.
// 보안 메모: 이건 "아는 사람만 들어오는" 가벼운 게이트다(소규모 신뢰 팀 전제).
// 강한 보안이 필요하면 Supabase Auth(개인 계정)로 교체. README 참고.

const GATE_KEY = "meetingroom:gate";
const MEMBER_KEY = "meetingroom:member";

const SITE_PASSWORD = (import.meta.env.VITE_SITE_PASSWORD as string | undefined) ?? "teamseuk";

export function checkPassword(input: string): boolean {
  return input.trim() === SITE_PASSWORD;
}

export function unlock() {
  sessionStorage.setItem(GATE_KEY, "1");
}

export function isUnlocked(): boolean {
  return sessionStorage.getItem(GATE_KEY) === "1";
}

export function lock() {
  sessionStorage.removeItem(GATE_KEY);
}

export function getMemberId(): string | null {
  return localStorage.getItem(MEMBER_KEY);
}

export function setMemberId(id: string) {
  localStorage.setItem(MEMBER_KEY, id);
}

export function clearMember() {
  localStorage.removeItem(MEMBER_KEY);
}
