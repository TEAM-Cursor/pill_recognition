import { useRouter } from 'expo-router';
import { FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, ScreenTitle, Tag } from '@/components/ui';
import { useAppState } from '@/lib/store';
import { font, space, useTokens } from '@/theme/tokens';

function dateLabel(ts: number): string {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function Dictionary() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { records } = useAppState();
  const sorted = [...records].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top }}>
      <ScreenTitle title="내 알약사전" subtitle={`기록 ${records.length}건 · 탭하면 이어서 물어볼 수 있어요`} />
      <FlatList
        data={sorted}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: 24, gap: space.md }}
        ListEmptyComponent={
          <Text style={{ color: t.textTertiary, fontSize: font.small, textAlign: 'center', marginTop: 40 }}>
            아직 기록이 없어요. 홈에서 알약을 비춰보세요.
          </Text>
        }
        renderItem={({ item }) => {
          const last = item.summaries[item.summaries.length - 1];
          const lastBullet = last ? last.bullets[last.bullets.length - 1] : '';
          return (
            <Card onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id } })}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: t.textPrimary, fontSize: font.h3, fontWeight: '600', flex: 1 }} numberOfLines={1}>
                  {item.pill.name}
                </Text>
                <Text style={{ color: t.textTertiary, fontSize: font.tiny, marginLeft: 8 }}>{dateLabel(item.createdAt)}</Text>
              </View>
              <Text style={{ color: t.textSecondary, fontSize: font.small, marginTop: 6 }} numberOfLines={1}>
                {lastBullet}
              </Text>
              <View style={{ marginTop: 10 }}>
                <Tag tone="accent" label={`요약 ${item.summaries.length}버전`} />
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
}
