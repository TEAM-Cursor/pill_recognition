import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppState } from '@/lib/store';
import type { ChatRecord } from '@/lib/types';
import { font, radius, space, useTokens } from '@/theme/tokens';

function SummaryModal({
  record,
  version,
  onClose,
  onNavigate,
}: {
  record: ChatRecord;
  version: number | null;
  onClose: () => void;
  onNavigate: (v: number) => void;
}) {
  const t = useTokens();
  if (version == null) return null;
  const doc = record.summaries.find((s) => s.version === version);
  if (!doc) return null;
  const hasPrev = version > 1;
  const hasNext = version < record.summaries.length;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: t.overlay, justifyContent: 'flex-end' }}>
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: t.surface,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            padding: space.xl,
            paddingBottom: 36,
            gap: space.md,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ color: t.textPrimary, fontSize: font.h3, fontWeight: '700' }}>{doc.title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={t.textTertiary} />
            </Pressable>
          </View>
          <Text style={{ color: t.textTertiary, fontSize: font.tiny }}>{doc.createdLabel} 시점 요약</Text>
          <View style={{ gap: 8 }}>
            {doc.bullets.map((b, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
                <Ionicons name="ellipse" size={6} color={t.accent} style={{ marginTop: 8 }} />
                <Text style={{ color: t.textPrimary, fontSize: font.body, lineHeight: 22, flex: 1 }}>{b}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: space.sm }}>
            <Pressable
              disabled={!hasPrev}
              onPress={() => onNavigate(version - 1)}
              style={{ opacity: hasPrev ? 1 : 0.3, flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Ionicons name="chevron-back" size={18} color={t.textSecondary} />
              <Text style={{ color: t.textSecondary, fontSize: font.small }}>이전 버전</Text>
            </Pressable>
            <Pressable
              disabled={!hasNext}
              onPress={() => onNavigate(version + 1)}
              style={{ opacity: hasNext ? 1 : 0.3, flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Text style={{ color: t.textSecondary, fontSize: font.small }}>다음 버전</Text>
              <Ionicons name="chevron-forward" size={18} color={t.textSecondary} />
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function Chat() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRecord, addUserQuestion } = useAppState();
  const record = getRecord(id);
  const [input, setInput] = useState('');
  const [openVersion, setOpenVersion] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  if (!record) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Stack.Screen options={{ headerShown: true, title: '' }} />
        <Text style={{ color: t.textSecondary }}>기록을 찾을 수 없어요.</Text>
      </View>
    );
  }

  const send = async () => {
    const q = input.trim();
    if (!q) return;
    setInput('');
    await addUserQuestion(record.id, q, new Date());
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: t.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <Stack.Screen options={{ headerShown: true, title: record.pill.name }} />
      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: space.lg, gap: space.md, paddingBottom: 24 }}>
        <View
          style={{
            backgroundColor: t.surface,
            borderRadius: radius.lg,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: t.border,
            padding: space.lg,
          }}
        >
          <Text style={{ color: t.textPrimary, fontSize: font.h3, fontWeight: '700' }}>{record.pill.name}</Text>
          <Text style={{ color: t.textSecondary, fontSize: font.small, marginTop: 4 }}>{record.pill.ingredient}</Text>
          <Text style={{ color: t.textTertiary, fontSize: font.tiny, marginTop: 6 }}>
            {record.pill.company} · {record.pill.shape} · {record.pill.color} · 식별 {record.pill.imprint}
          </Text>
        </View>

        {record.messages.map((m) =>
          m.role === 'assistant' ? (
            <View key={m.id} style={{ alignSelf: 'flex-start', maxWidth: '88%', gap: 6 }}>
              <View
                style={{
                  backgroundColor: t.surface,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: t.border,
                  borderRadius: radius.lg,
                  borderTopLeftRadius: 4,
                  padding: space.md,
                }}
              >
                <Text style={{ color: t.textPrimary, fontSize: font.body, lineHeight: 22 }}>{m.text}</Text>
              </View>
              {m.summaryVersion ? (
                <Pressable
                  onPress={() => setOpenVersion(m.summaryVersion ?? null)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    alignSelf: 'flex-start',
                    backgroundColor: t.accentSoft,
                    borderRadius: radius.pill,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}
                >
                  <Ionicons name="document-text-outline" size={13} color={t.accentText} />
                  <Text style={{ color: t.accentText, fontSize: font.tiny, fontWeight: '600' }}>요약 v{m.summaryVersion}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : (
            <View key={m.id} style={{ alignSelf: 'flex-end', maxWidth: '85%' }}>
              <View
                style={{
                  backgroundColor: t.accent,
                  borderRadius: radius.lg,
                  borderTopRightRadius: 4,
                  paddingHorizontal: space.md,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ color: t.onAccent, fontSize: font.body, lineHeight: 21 }}>{m.text}</Text>
              </View>
            </View>
          ),
        )}

        <View style={{ marginTop: space.sm }}>
          <Text style={{ color: t.textTertiary, fontSize: font.small, marginBottom: 8 }}>
            요약 문서 · {record.summaries.length}개 버전
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm, paddingRight: space.lg }}>
            {record.summaries.map((s) => (
              <Pressable
                key={s.version}
                onPress={() => setOpenVersion(s.version)}
                style={{
                  width: 190,
                  backgroundColor: t.surfaceAlt,
                  borderRadius: radius.lg,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderColor: t.border,
                  padding: space.md,
                }}
              >
                <Text style={{ color: t.accentText, fontSize: font.tiny, fontWeight: '700', marginBottom: 6 }}>
                  요약 v{s.version}
                  {s.version === record.summaries.length ? ' (최신)' : ''}
                </Text>
                {s.bullets.slice(0, 4).map((b, i) => (
                  <Text key={i} style={{ color: t.textSecondary, fontSize: font.tiny, lineHeight: 18 }} numberOfLines={1}>
                    · {b}
                  </Text>
                ))}
                {s.bullets.length > 4 ? (
                  <Text style={{ color: t.textTertiary, fontSize: font.tiny }}>+{s.bullets.length - 4}개 더</Text>
                ) : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.sm,
          paddingHorizontal: space.md,
          paddingTop: space.sm,
          paddingBottom: insets.bottom + 8,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: t.border,
          backgroundColor: t.surface,
        }}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="더 궁금한 점을 물어보세요"
          placeholderTextColor={t.textTertiary}
          style={{
            flex: 1,
            backgroundColor: t.inputBg,
            borderRadius: radius.pill,
            paddingHorizontal: 16,
            paddingVertical: 10,
            color: t.textPrimary,
            fontSize: font.body,
          }}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <Pressable
          onPress={send}
          style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="arrow-up" size={20} color={t.onAccent} />
        </Pressable>
      </View>

      <SummaryModal record={record} version={openVersion} onClose={() => setOpenVersion(null)} onNavigate={setOpenVersion} />
    </KeyboardAvoidingView>
  );
}
