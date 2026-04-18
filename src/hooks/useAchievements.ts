import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ACHIEVEMENTS,
  Achievement,
  AchievementId,
  GameOutcome,
  PlayerStats,
} from '@/data/achievements';
import { Storage } from '@/utils/storage';
import { fetchUnlockedAchievements, saveAchievementRemote } from '@/utils/supabase';

export interface UseAchievementsResult {
  unlocked: AchievementId[];
  toast: Achievement | null;
  dismissToast: () => void;
  /** Evaluate all conditions against (stats, outcome); unlock & toast any new ones. */
  evaluate: (stats: PlayerStats, outcome: GameOutcome) => Promise<AchievementId[]>;
  isUnlocked: (id: AchievementId) => boolean;
}

export function useAchievements(userId: string | null): UseAchievementsResult {
  const [unlocked, setUnlocked] = useState<AchievementId[]>([]);
  const [toastQueue, setToastQueue] = useState<Achievement[]>([]);
  const toast = toastQueue[0] ?? null;
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  // Hydrate from local storage immediately, then from Supabase if signed in.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = (await Storage.getUnlockedAchievements()) as AchievementId[];
      if (!cancelled) setUnlocked(local);
      if (userId) {
        const remote = await fetchUnlockedAchievements(userId);
        if (cancelled) return;
        const merged = Array.from(new Set([...local, ...remote])) as AchievementId[];
        setUnlocked(merged);
        await Storage.setUnlockedAchievements(merged);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Auto-advance toast queue every ~3s.
  useEffect(() => {
    if (toastQueue.length === 0) return;
    const h = setTimeout(() => {
      setToastQueue((q) => q.slice(1));
    }, 3000);
    return () => clearTimeout(h);
  }, [toastQueue]);

  const dismissToast = useCallback(() => {
    setToastQueue((q) => q.slice(1));
  }, []);

  const evaluate = useCallback(
    async (stats: PlayerStats, outcome: GameOutcome): Promise<AchievementId[]> => {
      const newly: Achievement[] = [];
      const currentUnlocked = new Set<AchievementId>(unlocked);
      for (const a of ACHIEVEMENTS) {
        if (currentUnlocked.has(a.id)) continue;
        try {
          if (a.check(stats, outcome)) newly.push(a);
        } catch (err) {
          console.warn('[achievements] check failed', a.id, err);
        }
      }
      if (newly.length === 0) return [];
      const newIds = newly.map((a) => a.id);
      const merged = Array.from(new Set([...unlocked, ...newIds]));
      setUnlocked(merged);
      await Storage.setUnlockedAchievements(merged);
      // Sync remote (best-effort).
      const uid = userIdRef.current;
      if (uid) {
        await Promise.all(newIds.map((id) => saveAchievementRemote(uid, id)));
      }
      setToastQueue((q) => [...q, ...newly]);
      return newIds;
    },
    [unlocked],
  );

  const isUnlocked = useCallback(
    (id: AchievementId) => unlocked.includes(id),
    [unlocked],
  );

  return useMemo(
    () => ({ unlocked, toast, dismissToast, evaluate, isUnlocked }),
    [unlocked, toast, dismissToast, evaluate, isUnlocked],
  );
}
