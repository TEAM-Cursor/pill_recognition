import { Ionicons } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui';
import { SKIP_CAMERA_GATE } from '@/lib/devFlags';
import { font, radius, space, useTokens } from '@/theme/tokens';

export default function Permission() {
  const t = useTokens();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (SKIP_CAMERA_GATE || permission?.granted) router.replace('/onboarding/profile');
  }, [permission?.granted, router]);

  async function ask() {
    const res = await requestPermission();
    if (res.granted) {
      router.replace('/onboarding/profile');
    } else {
      setDenied(true);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ flex: 1, paddingHorizontal: space.xxl, justifyContent: 'center', alignItems: 'center', gap: space.lg }}>
        <View
          style={{
            width: 92,
            height: 92,
            borderRadius: radius.xl,
            backgroundColor: t.accentSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="camera-outline" size={44} color={t.accentText} />
        </View>
        <Text style={{ color: t.textPrimary, fontSize: font.h1, fontWeight: '700', textAlign: 'center' }}>
          카메라 권한이 필요해요
        </Text>
        <Text style={{ color: t.textSecondary, fontSize: font.body, textAlign: 'center', lineHeight: 22 }}>
          알약을 비추면 종류를 인식해 맞춤 복약 안내를 드려요. 사진은 인식에만 쓰여요.
        </Text>
        {denied ? (
          <Text style={{ color: t.warnText, fontSize: font.small, textAlign: 'center' }}>
            권한이 거부됐어요. 기기 설정 → 앱 권한에서 카메라를 허용한 뒤 다시 시도해주세요.
          </Text>
        ) : null}
      </View>
      <View style={{ paddingHorizontal: space.xxl, paddingBottom: space.xl, gap: space.sm }}>
        <PrimaryButton label="카메라 허용하기" onPress={ask} />
        <Text style={{ color: t.textTertiary, fontSize: font.tiny, textAlign: 'center' }}>1 / 2 단계</Text>
      </View>
    </SafeAreaView>
  );
}
