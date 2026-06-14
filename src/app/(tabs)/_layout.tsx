import { Ionicons } from '@expo/vector-icons';
import { TopTabs } from 'expo-router/js-top-tabs';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { font, useTokens } from '@/theme/tokens';

export default function TabsLayout() {
  const t = useTokens();
  const insets = useSafeAreaInsets();

  return (
    <TopTabs
      tabBarPosition="bottom"
      initialRouteName="index"
      screenOptions={{
        lazy: true,
        swipeEnabled: true,
        tabBarActiveTintColor: t.accentText,
        tabBarInactiveTintColor: t.textTertiary,
        tabBarPressColor: 'transparent',
        tabBarShowIcon: true,
        tabBarStyle: {
          backgroundColor: t.surface,
          paddingBottom: insets.bottom,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: t.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarIndicatorStyle: { backgroundColor: t.accent, height: 2 },
        tabBarLabelStyle: { fontSize: font.tiny, fontWeight: '600', textTransform: 'none', margin: 0 },
        tabBarItemStyle: { paddingVertical: 4 },
        tabBarIconStyle: { height: 26 },
      }}
    >
      <TopTabs.Screen
        name="dictionary"
        options={{ title: '알약사전', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="book-outline" size={22} color={color} /> }}
      />
      <TopTabs.Screen
        name="index"
        options={{ title: '홈', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="scan-outline" size={22} color={color} /> }}
      />
      <TopTabs.Screen
        name="more"
        options={{ title: '기타', tabBarIcon: ({ color }: { color: string }) => <Ionicons name="grid-outline" size={22} color={color} /> }}
      />
    </TopTabs>
  );
}
