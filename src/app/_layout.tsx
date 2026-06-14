import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppStateProvider, useAppState } from '@/lib/store';
import { useTokens } from '@/theme/tokens';

function Guarded() {
  const { loading, profile } = useAppState();
  const segments = useSegments();
  const router = useRouter();
  const t = useTokens();

  useEffect(() => {
    if (loading) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!profile && !inOnboarding) {
      router.replace('/onboarding/permission');
    } else if (profile && inOnboarding) {
      router.replace('/');
    }
  }, [loading, profile, segments, router]);

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: t.bg }} />;
  }

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }} />;
}

export default function RootLayout() {
  const scheme = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppStateProvider>
          <Guarded />
        </AppStateProvider>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
