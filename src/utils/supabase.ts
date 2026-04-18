import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

/**
 * Typed Supabase database schema. Kept in sync with supabase/migrations/001_initial.sql.
 *
 * Uses `type` (not `interface`) and `{ [_ in never]: never }` for empty
 * categories — this is the exact format the Supabase CLI generates and the
 * only format @supabase/supabase-js v2 resolves without falling back to `never`.
 */
export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: UserInsert;
        Update: Partial<UserInsert>;
        Relationships: [];
      };
      daily_results: {
        Row: DailyResultRow;
        Insert: DailyResultInsert;
        Update: Partial<DailyResultInsert>;
        Relationships: [];
      };
      achievements: {
        Row: AchievementRow;
        Insert: AchievementInsert;
        Update: Partial<AchievementInsert>;
        Relationships: [];
      };
    };
    Views: {
      leaderboard_summary: {
        Row: LeaderboardRow;
        Relationships: [];
      };
    };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export interface UserRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  is_ad_free: boolean;
  created_at: string;
}
export interface UserInsert {
  id: string;
  display_name: string;
  avatar_url?: string | null;
  is_ad_free?: boolean;
}

export interface DailyResultRow {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  solved: boolean;
  attempts: number | null;
  word: string;
  created_at: string;
}
export interface DailyResultInsert {
  user_id: string;
  date: string;
  solved: boolean;
  attempts: number | null;
  word: string;
}

export interface AchievementRow {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}
export interface AchievementInsert {
  user_id: string;
  achievement_id: string;
}

export interface LeaderboardRow {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_wins: number;
  current_streak: number;
  max_streak: number;
  avg_attempts: number | null;
}

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (__DEV__ && (!SUPABASE_URL || !SUPABASE_ANON_KEY)) {
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is empty — ' +
      'leaderboard and achievements sync will be disabled in this build.',
  );
}

// NOTE: We do NOT pass <Database> to createClient because newer versions of
// @supabase/supabase-js (2.60+) changed GenericSchema constraints in a way
// that breaks hand-written Database types. Type safety is enforced instead at
// the function-helper level via explicit return type annotations and `as` casts.
export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/* -------------------------------------------------------------------------- */
/*  Query helpers                                                             */
/* -------------------------------------------------------------------------- */

export async function upsertUser(user: UserInsert): Promise<UserRow | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('users')
    .upsert(user, { onConflict: 'id' })
    .select()
    .single();
  if (error) {
    console.warn('[supabase] upsertUser failed', error.message);
    return null;
  }
  return data as UserRow;
}

export async function fetchUser(userId: string): Promise<UserRow | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('users')
    .select()
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.warn('[supabase] fetchUser failed', error.message);
    return null;
  }
  return (data ?? null) as UserRow | null;
}

export async function updateDisplayName(
  userId: string,
  displayName: string,
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase
    .from('users')
    .update({ display_name: displayName })
    .eq('id', userId);
  if (error) {
    console.warn('[supabase] updateDisplayName failed', error.message);
    return false;
  }
  return true;
}

export async function setAdFreeRemote(
  userId: string,
  isAdFree: boolean,
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase
    .from('users')
    .update({ is_ad_free: isAdFree })
    .eq('id', userId);
  if (error) {
    console.warn('[supabase] setAdFreeRemote failed', error.message);
    return false;
  }
  return true;
}

export async function saveDailyResult(
  result: DailyResultInsert,
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase
    .from('daily_results')
    .upsert(result, { onConflict: 'user_id,date' });
  if (error) {
    console.warn('[supabase] saveDailyResult failed', error.message);
    return false;
  }
  return true;
}

export async function saveAchievementRemote(
  userId: string,
  achievementId: string,
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase
    .from('achievements')
    .upsert(
      { user_id: userId, achievement_id: achievementId },
      { onConflict: 'user_id,achievement_id' },
    );
  if (error) {
    console.warn('[supabase] saveAchievementRemote failed', error.message);
    return false;
  }
  return true;
}

export async function fetchUnlockedAchievements(
  userId: string,
): Promise<string[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('achievements')
    .select('achievement_id')
    .eq('user_id', userId);
  if (error) {
    console.warn('[supabase] fetchUnlockedAchievements failed', error.message);
    return [];
  }
  return (data ?? []).map((row) => (row as AchievementRow).achievement_id);
}

export interface LeaderboardPage {
  rows: LeaderboardRow[];
  hasMore: boolean;
}

export async function fetchLeaderboard(
  page: number,
  pageSize: number = 20,
): Promise<LeaderboardPage> {
  if (!isSupabaseConfigured) return { rows: [], hasMore: false };
  const from = page * pageSize;
  const to = from + pageSize; // fetch one extra to detect hasMore
  const { data, error } = await supabase
    .from('leaderboard_summary')
    .select('*')
    .order('total_wins', { ascending: false })
    .order('max_streak', { ascending: false })
    .range(from, to);
  if (error) {
    console.warn('[supabase] fetchLeaderboard failed', error.message);
    return { rows: [], hasMore: false };
  }
  const rows = (data ?? []) as LeaderboardRow[];
  const hasMore = rows.length > pageSize;
  return { rows: hasMore ? rows.slice(0, pageSize) : rows, hasMore };
}

export async function fetchMyRank(userId: string): Promise<number | null> {
  if (!isSupabaseConfigured) return null;
  // Naive implementation: fetch top 1000 and find the user. Good enough for
  // an MVP; for a larger playerbase, materialize a rank column in the view.
  const { data, error } = await supabase
    .from('leaderboard_summary')
    .select('user_id')
    .order('total_wins', { ascending: false })
    .order('max_streak', { ascending: false })
    .limit(1000);
  if (error) {
    console.warn('[supabase] fetchMyRank failed', error.message);
    return null;
  }
  const idx = (data ?? []).findIndex((row) => (row as { user_id: string }).user_id === userId);
  return idx >= 0 ? idx + 1 : null;
}
