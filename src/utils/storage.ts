import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LetterEvaluation } from './gameLogic';

export const STORAGE_KEYS = {
  GAME_STATE: 'gameState',
  STATS: 'stats',
  SETTINGS: 'settings',
  AD_FREE: 'isAdFree',
  GAMES_SINCE_INTERSTITIAL: 'gamesSinceInterstitial',
  USER_PROFILE: 'userProfile',
  UNLOCKED_ACHIEVEMENTS: 'unlockedAchievements',
} as const;

export interface StoredGameState {
  lastPlayedDate: string;
  currentGuesses: string[]; // each guess stored as its raw letter-token join (lowercase)
  evaluations: LetterEvaluation[][]; // parallel to currentGuesses
  gameStatus: 'playing' | 'won' | 'lost';
  letterStates: Record<string, 'correct' | 'present' | 'absent'>;
  isAdFree: boolean;
}

export interface StoredStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  lastWonDate: string | null;
  guessDistribution: Record<'1' | '2' | '3' | '4' | '5' | '6', number>;
}

export interface StoredSettings {
  darkMode: boolean | null; // null = follow system
  colorblind: boolean;
  hardMode: boolean;
  language: 'uz' | 'ru' | 'en';
}

export const DEFAULT_STATS: StoredStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastWonDate: null,
  guessDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0 },
};

export const DEFAULT_SETTINGS: StoredSettings = {
  darkMode: null,
  colorblind: false,
  hardMode: false,
  language: 'uz',
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    // Corrupt JSON — drop it and return default so the game doesn't brick.
    console.warn(`[storage] failed to read ${key}`, err);
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[storage] failed to write ${key}`, err);
  }
}

export const Storage = {
  async getGameState(): Promise<StoredGameState | null> {
    return readJson<StoredGameState | null>(STORAGE_KEYS.GAME_STATE, null);
  },
  async setGameState(state: StoredGameState): Promise<void> {
    await writeJson(STORAGE_KEYS.GAME_STATE, state);
  },
  async clearGameState(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.GAME_STATE);
  },

  async getStats(): Promise<StoredStats> {
    return readJson<StoredStats>(STORAGE_KEYS.STATS, DEFAULT_STATS);
  },
  async setStats(stats: StoredStats): Promise<void> {
    await writeJson(STORAGE_KEYS.STATS, stats);
  },

  async getSettings(): Promise<StoredSettings> {
    const stored = await readJson<Partial<StoredSettings>>(
      STORAGE_KEYS.SETTINGS,
      DEFAULT_SETTINGS,
    );
    return { ...DEFAULT_SETTINGS, ...stored };
  },
  async setSettings(settings: StoredSettings): Promise<void> {
    await writeJson(STORAGE_KEYS.SETTINGS, settings);
  },

  async getAdFree(): Promise<boolean> {
    return readJson<boolean>(STORAGE_KEYS.AD_FREE, false);
  },
  async setAdFree(value: boolean): Promise<void> {
    await writeJson(STORAGE_KEYS.AD_FREE, value);
  },

  async getGamesSinceInterstitial(): Promise<number> {
    return readJson<number>(STORAGE_KEYS.GAMES_SINCE_INTERSTITIAL, 0);
  },
  async setGamesSinceInterstitial(value: number): Promise<void> {
    await writeJson(STORAGE_KEYS.GAMES_SINCE_INTERSTITIAL, value);
  },

  async getUnlockedAchievements(): Promise<string[]> {
    return readJson<string[]>(STORAGE_KEYS.UNLOCKED_ACHIEVEMENTS, []);
  },
  async setUnlockedAchievements(ids: string[]): Promise<void> {
    await writeJson(STORAGE_KEYS.UNLOCKED_ACHIEVEMENTS, ids);
  },
};
