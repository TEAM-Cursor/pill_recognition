import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui';
import { SKIP_CAMERA_GATE } from '@/lib/devFlags';
import { pickPill } from '@/lib/mock';
import { useAppState } from '@/lib/store';
import { font, radius, space, useTokens } from '@/theme/tokens';

type Phase = 'scanning' | 'done';

export default function Home() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { createRecordFromPill } = useAppState();
  const [permission, requestPermission] = useCameraPermissions();
  const [phase, setPhase] = useState<Phase>('scanning');
  const [focused, setFocused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busy = useRef(false);

  const clear = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const finish = useCallback(async () => {
    if (busy.current || (!permission?.granted && !SKIP_CAMERA_GATE)) return;
    busy.current = true;
    clear();
    setPhase('done');
    const rec = await createRecordFromPill(pickPill(), new Date());
    timer.current = setTimeout(() => {
      router.push({ pathname: '/chat/[id]', params: { id: rec.id } });
    }, 750);
  }, [permission?.granted, createRecordFromPill, router]);

  const arm = useCallback(() => {
    if (!permission?.granted && !SKIP_CAMERA_GATE) return;
    busy.current = false;
    setPhase('scanning');
    clear();
    timer.current = setTimeout(() => {
      void finish();
    }, 2600);
  }, [permission?.granted, finish]);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      arm();
      return () => {
        setFocused(false);
        clear();
      };
    }, [arm]),
  );

  if (!permission && !SKIP_CAMERA_GATE) {
    return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  }

  if (!permission?.granted && !SKIP_CAMERA_GATE) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center', padding: space.xxl, gap: space.md }}>
        <Ionicons name="camera-outline" size={44} color={t.textTertiary} />
        <Text style={{ color: t.textPrimary, fontSize: font.h3, fontWeight: '600', textAlign: 'center' }}>카메라 권한이 꺼져 있어요</Text>
        <Text style={{ color: t.textSecondary, fontSize: font.small, textAlign: 'center' }}>알약 인식을 위해 카메라를 허용해주세요.</Text>
        <PrimaryButton label="권한 허용" onPress={() => void requestPermission()} style={{ alignSelf: 'stretch', marginTop: space.sm }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      {permission?.granted ? (
        <CameraView style={StyleSheet.absoluteFill} facing="back" active={focused} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#111' }]} />
      )}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.25)' }]} pointerEvents="none" />

      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Pressable
            onPress={() => void finish()}
            style={{
              width: 250,
              height: 250,
              borderRadius: radius.xl,
              borderWidth: 2,
              borderColor: phase === 'done' ? t.accent : 'rgba(255,255,255,0.9)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {phase === 'scanning' ? (
              <View style={{ alignItems: 'center', gap: 10 }}>
                <ActivityIndicator color="#fff" />
                <Text style={{ color: '#fff', fontSize: font.small }}>사각형 안에 맞춰 정지하세요</Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center', gap: 8 }}>
                <Ionicons name="checkmark-circle" size={56} color={t.accent} />
                <Text style={{ color: '#fff', fontSize: font.body, fontWeight: '600' }}>인식 완료</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <View style={{ position: 'absolute', top: insets.top + 12, left: 0, right: 0, alignItems: 'center' }} pointerEvents="none">
        <View style={{ backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 7 }}>
          <Text style={{ color: '#fff', fontSize: font.small }}>알약을 비추면 자동으로 인식돼요</Text>
        </View>
      </View>
    </View>
  );
}
