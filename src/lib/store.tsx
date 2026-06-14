import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { buildIntro, buildReply, newId, seedRecords } from './mock';
import type { ChatRecord, PillInfo, Profile } from './types';

const KEY_PROFILE = 'pr.profile.v1';
const KEY_RECORDS = 'pr.records.v1';

type AppState = {
  loading: boolean;
  profile: Profile | null;
  records: ChatRecord[];
  saveProfile: (p: Profile) => Promise<void>;
  getRecord: (id: string | undefined) => ChatRecord | undefined;
  createRecordFromPill: (pill: PillInfo, now: Date) => Promise<ChatRecord>;
  addUserQuestion: (id: string, text: string, now: Date) => Promise<void>;
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [records, setRecords] = useState<ChatRecord[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [p, r] = await Promise.all([AsyncStorage.getItem(KEY_PROFILE), AsyncStorage.getItem(KEY_RECORDS)]);
        if (p) setProfile(JSON.parse(p) as Profile);
        setRecords(r ? (JSON.parse(r) as ChatRecord[]) : seedRecords());
      } catch {
        setRecords(seedRecords());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // records 변경 시 영속화 (초기 로딩 중에는 건너뜀)
  useEffect(() => {
    if (loading) return;
    AsyncStorage.setItem(KEY_RECORDS, JSON.stringify(records)).catch(() => {});
  }, [records, loading]);

  const saveProfile = useCallback(async (p: Profile) => {
    setProfile(p);
    await AsyncStorage.setItem(KEY_PROFILE, JSON.stringify(p)).catch(() => {});
  }, []);

  const getRecord = useCallback(
    (id: string | undefined) => (id ? records.find((x) => x.id === id) : undefined),
    [records],
  );

  const createRecordFromPill = useCallback(
    async (pill: PillInfo, now: Date) => {
      const effectiveProfile: Profile = profile ?? { age: '', sex: 'other', pregnancy: 'none', meds: '', allergies: '' };
      const { message, summary } = buildIntro(pill, effectiveProfile, now);
      const record: ChatRecord = {
        id: newId('rec'),
        pill,
        createdAt: now.getTime(),
        messages: [{ id: newId('m'), role: 'assistant', text: message, summaryVersion: 1 }],
        summaries: [summary],
      };
      setRecords((prev) => [record, ...prev]);
      return record;
    },
    [profile],
  );

  const addUserQuestion = useCallback(async (id: string, text: string, now: Date) => {
    setRecords((prev) =>
      prev.map((rec) => {
        if (rec.id !== id) return rec;
        const lastSummary = rec.summaries[rec.summaries.length - 1];
        const { message, summary } = buildReply(text, lastSummary, now);
        return {
          ...rec,
          messages: [
            ...rec.messages,
            { id: newId('m'), role: 'user', text },
            { id: newId('m'), role: 'assistant', text: message, summaryVersion: summary.version },
          ],
          summaries: [...rec.summaries, summary],
        };
      }),
    );
  }, []);

  const value = useMemo<AppState>(
    () => ({ loading, profile, records, saveProfile, getRecord, createRecordFromPill, addUserQuestion }),
    [loading, profile, records, saveProfile, getRecord, createRecordFromPill, addUserQuestion],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAppState must be used within AppStateProvider');
  return v;
}
