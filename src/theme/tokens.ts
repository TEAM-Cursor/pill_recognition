import { useColorScheme } from 'react-native';

// pill_recognition 디자인 토큰 (M0 임시 — M1에서 .design/system.md로 확정)
// 세계관: 차분한 약국/헬스 어시스턴트. 액센트 = 건강·안전의 teal-green.
export type Tokens = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  inputBg: string;
  border: string;
  borderStrong: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  accentText: string;
  accentSoft: string;
  onAccent: string;
  warn: string;
  warnText: string;
  warnSoft: string;
  danger: string;
  dangerText: string;
  dangerSoft: string;
  overlay: string;
};

const light: Tokens = {
  bg: '#F6F8F5',
  surface: '#FFFFFF',
  surfaceAlt: '#EDF1EC',
  inputBg: '#EFF2EC',
  border: 'rgba(20,40,30,0.10)',
  borderStrong: 'rgba(20,40,30,0.20)',
  textPrimary: '#19211C',
  textSecondary: '#586B60',
  textTertiary: '#8A968E',
  accent: '#1F9E76',
  accentText: '#0F6E56',
  accentSoft: '#E1F5EE',
  onAccent: '#FFFFFF',
  warn: '#B5710F',
  warnText: '#85510B',
  warnSoft: '#FBEFD9',
  danger: '#C0392B',
  dangerText: '#922A20',
  dangerSoft: '#FBE9E7',
  overlay: 'rgba(15,22,18,0.45)',
};

const dark: Tokens = {
  bg: '#0F120E',
  surface: '#171B15',
  surfaceAlt: '#20251E',
  inputBg: '#1B201A',
  border: 'rgba(220,235,225,0.12)',
  borderStrong: 'rgba(220,235,225,0.24)',
  textPrimary: '#ECF1EC',
  textSecondary: '#A9B6AC',
  textTertiary: '#79857C',
  accent: '#36B68C',
  accentText: '#9FE1CB',
  accentSoft: '#103A2E',
  onAccent: '#06201A',
  warn: '#E0A23A',
  warnText: '#F2C879',
  warnSoft: '#33260E',
  danger: '#E2675A',
  dangerText: '#F2A89E',
  dangerSoft: '#33201D',
  overlay: 'rgba(0,0,0,0.55)',
};

export function useTokens(): Tokens {
  return useColorScheme() === 'dark' ? dark : light;
}

export const radius = { sm: 8, md: 12, lg: 18, xl: 24, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
export const font = { h1: 24, h2: 19, h3: 16, body: 15, small: 13, tiny: 11 } as const;
