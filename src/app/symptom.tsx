import { Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, PrimaryButton } from '@/components/ui';
import { mockRecommend } from '@/lib/mock';
import { font, radius, space, useTokens } from '@/theme/tokens';

const CHIPS = ['두통', '콧물·코막힘', '소화불량', '기침', '근육통'];

export default function Symptom() {
  const t = useTokens();
  const [q, setQ] = useState('');
  const [result, setResult] = useState<{ symptom: string; items: { name: string; note: string }[] } | null>(null);

  const run = (s: string) => {
    const sym = s.trim();
    if (!sym) return;
    setQ(sym);
    setResult({ symptom: sym, items: mockRecommend(sym) });
  };

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: t.bg }}>
      <Stack.Screen options={{ headerShown: true, title: '증상별 약 추천' }} />
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg }} keyboardShouldPersistTaps="handled">
        <View style={{ backgroundColor: t.warnSoft, borderRadius: radius.md, padding: space.md }}>
          <Text style={{ color: t.warnText, fontSize: font.tiny, lineHeight: 18 }}>
            일반의약품(OTC) 정보 제공용이며 진단·처방이 아니에요. 증상이 지속되거나 심하면 약사·의사와 상담하세요.
          </Text>
        </View>

        <View>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="증상을 입력하세요 (예: 두통)"
            placeholderTextColor={t.textTertiary}
            style={{
              backgroundColor: t.inputBg,
              borderRadius: radius.md,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: t.border,
              paddingHorizontal: 14,
              paddingVertical: 12,
              color: t.textPrimary,
              fontSize: font.body,
            }}
            onSubmitEditing={() => run(q)}
            returnKeyType="search"
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {CHIPS.map((c) => (
              <Pressable
                key={c}
                onPress={() => run(c)}
                style={{ backgroundColor: t.surfaceAlt, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 }}
              >
                <Text style={{ color: t.textSecondary, fontSize: font.small }}>{c}</Text>
              </Pressable>
            ))}
          </View>
          <PrimaryButton label="추천 보기" onPress={() => run(q)} style={{ marginTop: space.md }} />
        </View>

        {result ? (
          <View style={{ gap: space.sm }}>
            <Text style={{ color: t.textSecondary, fontSize: font.small }}>‘{result.symptom}’에 도움이 될 수 있는 약</Text>
            {result.items.map((it) => (
              <Card key={it.name}>
                <Text style={{ color: t.textPrimary, fontSize: font.h3, fontWeight: '600' }}>{it.name}</Text>
                <Text style={{ color: t.textSecondary, fontSize: font.small, marginTop: 4 }}>{it.note}</Text>
              </Card>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
