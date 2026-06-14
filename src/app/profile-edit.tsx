import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ProfileForm from '@/components/ProfileForm';
import { useAppState } from '@/lib/store';
import { space, useTokens } from '@/theme/tokens';

export default function ProfileEdit() {
  const t = useTokens();
  const router = useRouter();
  const { profile, saveProfile } = useAppState();

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: t.bg }}>
      <Stack.Screen options={{ headerShown: true, title: '내 정보 수정' }} />
      <View style={{ height: space.lg }} />
      <ProfileForm
        initial={profile}
        submitLabel="저장"
        onSubmit={async (p) => {
          await saveProfile(p);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}
