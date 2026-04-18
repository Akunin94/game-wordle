/**
 * Achievement definitions. Labels are in Uzbek to match the app audience.
 * The `check` predicate is applied after each game to determine whether the
 * achievement has just been unlocked (see useAchievements.ts).
 */

export type AchievementId =
  | 'first_win'
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'
  | 'streak_100'
  | 'perfect_guess'
  | 'two_guess'
  | 'played_10'
  | 'played_50'
  | 'played_100'
  | 'win_rate_90'
  | 'no_yellow';

export interface GameOutcome {
  solved: boolean;
  attempts: number | null; // null when lost
  /**
   * Number of yellow tiles (present-letter evaluations) produced across ALL
   * guesses in this finished game. Used by the "no_yellow" achievement.
   */
  yellowCount: number;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  lastWonDate: string | null;
  guessDistribution: Record<'1' | '2' | '3' | '4' | '5' | '6', number>;
}

export interface Achievement {
  id: AchievementId;
  label: string;
  desc: string;
  icon: string;
  /**
   * Returns true if this achievement's condition is satisfied for the given
   * stats + outcome pair. The caller de-duplicates against previously unlocked
   * achievements — this function does not know about prior unlocks.
   */
  check: (stats: PlayerStats, outcome: GameOutcome) => boolean;
}

export const ACHIEVEMENTS: readonly Achievement[] = [
  {
    id: 'first_win',
    label: 'Birinchi gʻalaba',
    desc: 'Birinchi oʻyinda gʻalaba qozonish',
    icon: '🏆',
    check: (stats, outcome) => outcome.solved && stats.gamesWon === 1,
  },
  {
    id: 'streak_3',
    label: '3 kun ketma-ket',
    desc: '3 kun ketma-ket gʻalaba',
    icon: '🔥',
    check: (stats) => stats.currentStreak >= 3,
  },
  {
    id: 'streak_7',
    label: 'Haftalik jangchi',
    desc: '7 kun ketma-ket gʻalaba',
    icon: '⚔️',
    check: (stats) => stats.currentStreak >= 7,
  },
  {
    id: 'streak_30',
    label: 'Oylik ustoz',
    desc: '30 kun ketma-ket gʻalaba',
    icon: '👑',
    check: (stats) => stats.currentStreak >= 30,
  },
  {
    id: 'streak_100',
    label: 'Legenda',
    desc: '100 kun ketma-ket gʻalaba',
    icon: '⭐',
    check: (stats) => stats.currentStreak >= 100,
  },
  {
    id: 'perfect_guess',
    label: 'Mutlaq!',
    desc: 'Soʻzni 1 urinishda topish',
    icon: '⚡',
    check: (_stats, outcome) => outcome.solved && outcome.attempts === 1,
  },
  {
    id: 'two_guess',
    label: 'Usta',
    desc: 'Soʻzni 2 urinishda topish',
    icon: '🎯',
    check: (_stats, outcome) => outcome.solved && outcome.attempts === 2,
  },
  {
    id: 'played_10',
    label: 'Oʻyinchi',
    desc: '10 ta oʻyin oʻynash',
    icon: '🎮',
    check: (stats) => stats.gamesPlayed >= 10,
  },
  {
    id: 'played_50',
    label: 'Veteran',
    desc: '50 ta oʻyin oʻynash',
    icon: '🛡️',
    check: (stats) => stats.gamesPlayed >= 50,
  },
  {
    id: 'played_100',
    label: '100 oʻyin',
    desc: '100 ta oʻyin oʻynash',
    icon: '💯',
    check: (stats) => stats.gamesPlayed >= 100,
  },
  {
    id: 'win_rate_90',
    label: 'Beqiyos',
    desc: '90%+ gʻalaba koʻrsatkichi (minimum 20 oʻyin)',
    icon: '📈',
    check: (stats) =>
      stats.gamesPlayed >= 20 &&
      stats.gamesWon / Math.max(1, stats.gamesPlayed) >= 0.9,
  },
  {
    id: 'no_yellow',
    label: 'Aniq nishon',
    desc: 'Hech qanday sariq katakcha ishlatmasdan gʻalaba qozonish',
    icon: '🌟',
    check: (_stats, outcome) => outcome.solved && outcome.yellowCount === 0,
  },
];

export const ACHIEVEMENT_BY_ID: Record<AchievementId, Achievement> =
  ACHIEVEMENTS.reduce((acc, a) => {
    acc[a.id] = a;
    return acc;
  }, {} as Record<AchievementId, Achievement>);
