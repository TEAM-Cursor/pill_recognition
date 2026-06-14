import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Label, PrimaryButton } from '@/components/ui';
import { font, radius, space, useTokens } from '@/theme/tokens';
import type { Pregnancy, Profile, Sex } from '@/lib/types';

type Option<T extends string> = { value: T; label: string };

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}) {
  const t = useTokens();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: t.surfaceAlt, borderRadius: radius.md, padding: 3 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: radius.sm,
              alignItems: 'center',
              backgroundColor: active ? t.surface : 'transparent',
              borderWidth: active ? StyleSheet.hairlineWidth : 0,
              borderColor: t.border,
            }}
          >
            <Text style={{ color: active ? t.textPrimary : t.textSecondary, fontSize: font.small, fontWeight: active ? '600' : '400' }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function ProfileForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Profile | null;
  submitLabel: string;
  onSubmit: (p: Profile) => void;
}) {
  const t = useTokens();
  const [age, setAge] = useState(initial?.age ?? '');
  const [sex, setSex] = useState<Sex>(initial?.sex ?? 'female');
  const [pregnancy, setPregnancy] = useState<Pregnancy>(initial?.pregnancy ?? 'none');
  const [meds, setMeds] = useState(initial?.meds ?? '');
  const [allergies, setAllergies] = useState(initial?.allergies ?? '');

  const valid = age.trim().length > 0;

  const inputStyle = {
    backgroundColor: t.inputBg,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: t.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: t.textPrimary,
    fontSize: font.body,
  } as const;

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: space.xl, paddingBottom: 40, gap: space.lg }}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <Label>나이</Label>
        <TextInput
          value={age}
          onChangeText={setAge}
          placeholder="예: 34"
          placeholderTextColor={t.textTertiary}
          keyboardType="number-pad"
          style={inputStyle}
        />
      </View>

      <View>
        <Label>성별</Label>
        <Segmented<Sex>
          value={sex}
          onChange={setSex}
          options={[
            { value: 'female', label: '여성' },
            { value: 'male', label: '남성' },
            { value: 'other', label: '기타' },
          ]}
        />
      </View>

      <View>
        <Label>임신 / 수유</Label>
        <Segmented<Pregnancy>
          value={pregnancy}
          onChange={setPregnancy}
          options={[
            { value: 'none', label: '해당 없음' },
            { value: 'pregnant', label: '임신 중' },
            { value: 'nursing', label: '수유 중' },
          ]}
        />
      </View>

      <View>
        <Label>복용 중인 약 (선택)</Label>
        <TextInput
          value={meds}
          onChangeText={setMeds}
          placeholder="예: 혈압약, 종합감기약"
          placeholderTextColor={t.textTertiary}
          style={inputStyle}
        />
      </View>

      <View>
        <Label>알레르기 (선택)</Label>
        <TextInput
          value={allergies}
          onChangeText={setAllergies}
          placeholder="예: 페니실린, 아스피린"
          placeholderTextColor={t.textTertiary}
          style={inputStyle}
        />
      </View>

      <PrimaryButton
        label={submitLabel}
        disabled={!valid}
        onPress={() => onSubmit({ age: age.trim(), sex, pregnancy, meds: meds.trim(), allergies: allergies.trim() })}
        style={{ marginTop: space.sm }}
      />
      <Text style={{ color: t.textTertiary, fontSize: font.tiny, textAlign: 'center' }}>
        입력 정보는 이 기기에만 저장돼요.
      </Text>
    </ScrollView>
  );
}
