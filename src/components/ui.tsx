import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

import { font, radius, space, useTokens } from '@/theme/tokens';

export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const t = useTokens();
  const base: ViewStyle = {
    backgroundColor: t.surface,
    borderColor: t.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radius.lg,
    padding: space.lg,
  };
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [base, style, pressed ? { opacity: 0.7 } : null]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTokens();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: disabled ? t.surfaceAlt : t.accent,
          borderRadius: radius.md,
          paddingVertical: 15,
          alignItems: 'center',
          justifyContent: 'center',
        },
        pressed && !disabled ? { opacity: 0.85 } : null,
        style,
      ]}
    >
      <Text style={{ color: disabled ? t.textTertiary : t.onAccent, fontSize: font.body, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function GhostButton({ label, onPress }: { label: string; onPress: () => void }) {
  const t = useTokens();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ paddingVertical: 12, alignItems: 'center' }, pressed ? { opacity: 0.6 } : null]}>
      <Text style={{ color: t.textSecondary, fontSize: font.small }}>{label}</Text>
    </Pressable>
  );
}

export function Tag({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'accent' | 'warn' }) {
  const t = useTokens();
  const bg = tone === 'accent' ? t.accentSoft : tone === 'warn' ? t.warnSoft : t.surfaceAlt;
  const fg = tone === 'accent' ? t.accentText : tone === 'warn' ? t.warnText : t.textSecondary;
  return (
    <View style={{ backgroundColor: bg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' }}>
      <Text style={{ color: fg, fontSize: font.tiny, fontWeight: '500' }}>{label}</Text>
    </View>
  );
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const t = useTokens();
  return (
    <View style={{ paddingHorizontal: space.xl, paddingTop: space.sm, paddingBottom: space.lg }}>
      <Text style={{ color: t.textPrimary, fontSize: font.h1, fontWeight: '700' }}>{title}</Text>
      {subtitle ? <Text style={{ color: t.textSecondary, fontSize: font.small, marginTop: 4 }}>{subtitle}</Text> : null}
    </View>
  );
}

export function Label({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTokens();
  return <Text style={[{ color: t.textTertiary, fontSize: font.small, marginBottom: 6 }, style]}>{children}</Text>;
}
