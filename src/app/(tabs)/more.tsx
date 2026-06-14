import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, ScreenTitle } from '@/components/ui';
import { font, radius, space, useTokens } from '@/theme/tokens';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function MenuCard({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: IoniconName;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const t = useTokens();
  return (
    <Card onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: radius.md,
            backgroundColor: t.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={icon} size={24} color={t.accentText} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.textPrimary, fontSize: font.h3, fontWeight: '600' }}>{title}</Text>
          <Text style={{ color: t.textSecondary, fontSize: font.small, marginTop: 3 }}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={t.textTertiary} />
      </View>
    </Card>
  );
}

export default function More() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top }}>
      <ScreenTitle title="기타" />
      <View style={{ paddingHorizontal: space.xl, gap: space.md }}>
        <MenuCard
          icon="person-circle-outline"
          title="내 정보 입력"
          subtitle="나이·성별·복용약·알레르기 수정"
          onPress={() => router.push('/profile-edit')}
        />
        <MenuCard
          icon="medkit-outline"
          title="증상별 약 추천"
          subtitle="증상을 입력하면 일반의약품을 추천"
          onPress={() => router.push('/symptom')}
        />
      </View>
    </View>
  );
}
