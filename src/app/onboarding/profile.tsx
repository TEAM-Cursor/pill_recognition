import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileForm from '@/components/ProfileForm';
import { useAppState } from '@/lib/store';
import { font, space, useTokens } from '@/theme/tokens';

export default function OnboardingProfile() {
  const t = useTokens();
  const router = useRouter();
  const { saveProfile } = useAppState();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ paddingHorizontal: space.xl, paddingTop: space.lg, paddingBottom: space.md }}>
        <Text style={{ color: t.textPrimary, fontSize: font.h1, fontWeight: '700' }}>내 정보 입력</Text>
        <Text style={{ color: t.textSecondary, fontSize: font.small, marginTop: 4 }}>
          나이·성별에 맞춰 안내해드려요. 한 번만 입력하면 돼요.
        </Text>
      </View>
      <ProfileForm
        submitLabel="완료하고 시작하기"
        onSubmit={async (p) => {
          await saveProfile(p);
          router.replace('/');
        }}
      />
    </SafeAreaView>
  );
}
