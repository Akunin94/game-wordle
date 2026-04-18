import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import {
  countYellows,
  evaluateGuess,
  getDailyWord,
  getTodayIso,
  isValidWord,
  LetterEvaluation,
  MAX_ATTEMPTS,
  satisfiesHardMode,
  tokenizeUzbek,
  WORD_LENGTH,
} from '@/utils/gameLogic';
import { Storage, StoredGameState, StoredStats } from '@/utils/storage';

export type GameStatus = 'playing' | 'won' | 'lost';

export interface GuessRow {
  tokens: string[];
  evals: LetterEvaluation[];
}

export interface GameState {
  hydrated: boolean;
  today: string;
  solutionTokens: string[];
  submittedGuesses: GuessRow[];
  currentInputTokens: string[];
  status: GameStatus;
  toast: { message: string; id: number } | null;
  shake: boolean;
  letterStates: Record<string, 'correct' | 'present' | 'absent'>;
}

type Action =
  | { type: 'HYDRATE'; payload: Partial<GameState> & { today: string; solutionTokens: string[] } }
  | { type: 'ADD_LETTER'; token: string }
  | { type: 'REMOVE_LETTER' }
  | { type: 'SUBMIT_SUCCESS'; row: GuessRow; status: GameStatus; letterStates: GameState['letterStates'] }
  | { type: 'SHAKE'; message: string }
  | { type: 'CLEAR_TOAST' }
  | { type: 'RESET_SHAKE' };

let toastSeq = 0;

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, hydrated: true };
    case 'ADD_LETTER':
      if (state.status !== 'playing') return state;
      if (state.currentInputTokens.length >= WORD_LENGTH) return state;
      return {
        ...state,
        currentInputTokens: [...state.currentInputTokens, action.token],
      };
    case 'REMOVE_LETTER':
      if (state.status !== 'playing') return state;
      if (state.currentInputTokens.length === 0) return state;
      return {
        ...state,
        currentInputTokens: state.currentInputTokens.slice(0, -1),
      };
    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        submittedGuesses: [...state.submittedGuesses, action.row],
        currentInputTokens: [],
        status: action.status,
        letterStates: action.letterStates,
      };
    case 'SHAKE':
      toastSeq += 1;
      return { ...state, shake: true, toast: { message: action.message, id: toastSeq } };
    case 'CLEAR_TOAST':
      return { ...state, toast: null };
    case 'RESET_SHAKE':
      return { ...state, shake: false };
    default:
      return state;
  }
}

const initialState: GameState = {
  hydrated: false,
  today: '',
  solutionTokens: [],
  submittedGuesses: [],
  currentInputTokens: [],
  status: 'playing',
  toast: null,
  shake: false,
  letterStates: {},
};

function computeLetterStates(rows: GuessRow[]): GameState['letterStates'] {
  const map: GameState['letterStates'] = {};
  const priority: Record<'correct' | 'present' | 'absent', number> = {
    correct: 3,
    present: 2,
    absent: 1,
  };
  for (const row of rows) {
    for (let i = 0; i < row.tokens.length; i += 1) {
      const token = row.tokens[i]!;
      const ev = row.evals[i]!;
      if (ev === 'correct' || ev === 'present' || ev === 'absent') {
        const existing = map[token];
        if (!existing || priority[ev] > priority[existing]) {
          map[token] = ev;
        }
      }
    }
  }
  return map;
}

function updateStatsOnFinish(
  prev: StoredStats,
  solved: boolean,
  attempts: number | null,
  today: string,
): StoredStats {
  const next: StoredStats = {
    gamesPlayed: prev.gamesPlayed + 1,
    gamesWon: prev.gamesWon + (solved ? 1 : 0),
    currentStreak: prev.currentStreak,
    maxStreak: prev.maxStreak,
    lastWonDate: prev.lastWonDate,
    guessDistribution: { ...prev.guessDistribution },
  };
  if (solved) {
    if (prev.lastWonDate) {
      const last = new Date(`${prev.lastWonDate}T00:00:00Z`);
      const todayDate = new Date(`${today}T00:00:00Z`);
      const diff = Math.round(
        (todayDate.getTime() - last.getTime()) / 86_400_000,
      );
      next.currentStreak = diff === 1 ? prev.currentStreak + 1 : 1;
    } else {
      next.currentStreak = 1;
    }
    next.maxStreak = Math.max(prev.maxStreak, next.currentStreak);
    next.lastWonDate = today;
    if (attempts && attempts >= 1 && attempts <= 6) {
      const key = String(attempts) as keyof StoredStats['guessDistribution'];
      next.guessDistribution[key] = next.guessDistribution[key] + 1;
    }
  } else {
    next.currentStreak = 0;
  }
  return next;
}

export interface UseGameOptions {
  hardMode: boolean;
  /** Called whenever a game ends (win or lose). Runs after storage persistence. */
  onFinish?: (payload: {
    solved: boolean;
    attempts: number | null;
    yellowCount: number;
    word: string;
    stats: StoredStats;
  }) => void;
}

export interface UseGameResult {
  state: GameState;
  pressLetter: (token: string) => void;
  pressBackspace: () => void;
  pressEnter: () => void;
  revealRandomLetter: () => string | null;
}

export function useGame(options: UseGameOptions): UseGameResult {
  const [state, dispatch] = useReducer(reducer, initialState);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Hydrate on mount — load stored game state if still today, else start fresh.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const today = getTodayIso();
      const solution = tokenizeUzbek(getDailyWord());
      const stored = await Storage.getGameState();
      if (cancelled) return;

      if (stored && stored.lastPlayedDate === today) {
        const submittedGuesses: GuessRow[] = stored.currentGuesses.map((raw, i) => ({
          tokens: tokenizeUzbek(raw),
          evals: stored.evaluations[i] ?? [],
        }));
        dispatch({
          type: 'HYDRATE',
          payload: {
            today,
            solutionTokens: solution,
            submittedGuesses,
            currentInputTokens: [],
            status: stored.gameStatus,
            letterStates: stored.letterStates,
          },
        });
      } else {
        // New day — clear any stale state.
        await Storage.clearGameState();
        dispatch({
          type: 'HYDRATE',
          payload: {
            today,
            solutionTokens: solution,
            submittedGuesses: [],
            currentInputTokens: [],
            status: 'playing',
            letterStates: {},
          },
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist on every meaningful change.
  useEffect(() => {
    if (!state.hydrated) return;
    const payload: StoredGameState = {
      lastPlayedDate: state.today,
      currentGuesses: state.submittedGuesses.map((row) => row.tokens.join('')),
      evaluations: state.submittedGuesses.map((row) => row.evals),
      gameStatus: state.status,
      letterStates: state.letterStates,
      isAdFree: false, // ad-free is managed separately in useAds
    };
    void Storage.setGameState(payload);
  }, [
    state.hydrated,
    state.today,
    state.submittedGuesses,
    state.status,
    state.letterStates,
  ]);

  // Auto-clear toast after 2s and reset shake flag.
  useEffect(() => {
    if (!state.toast) return;
    const h = setTimeout(() => {
      dispatch({ type: 'CLEAR_TOAST' });
    }, 2000);
    return () => clearTimeout(h);
  }, [state.toast]);

  useEffect(() => {
    if (!state.shake) return;
    const h = setTimeout(() => dispatch({ type: 'RESET_SHAKE' }), 500);
    return () => clearTimeout(h);
  }, [state.shake]);

  const pressLetter = useCallback((token: string) => {
    dispatch({ type: 'ADD_LETTER', token });
  }, []);

  const pressBackspace = useCallback(() => {
    dispatch({ type: 'REMOVE_LETTER' });
  }, []);

  const pressEnter = useCallback(async () => {
    if (state.status !== 'playing') return;
    if (state.currentInputTokens.length !== WORD_LENGTH) {
      dispatch({ type: 'SHAKE', message: 'Not enough letters' });
      return;
    }
    const guessRaw = state.currentInputTokens.join('');
    if (!isValidWord(guessRaw)) {
      dispatch({ type: 'SHAKE', message: 'Not in word list' });
      return;
    }
    const alreadyTried = state.submittedGuesses.some(
      (row) => row.tokens.join('') === guessRaw,
    );
    if (alreadyTried) {
      dispatch({ type: 'SHAKE', message: 'Already guessed' });
      return;
    }
    if (optionsRef.current.hardMode) {
      const hm = satisfiesHardMode(state.currentInputTokens, state.submittedGuesses);
      if (!hm.ok) {
        dispatch({ type: 'SHAKE', message: hm.reason });
        return;
      }
    }
    const evals = evaluateGuess(state.currentInputTokens, state.solutionTokens);
    const row: GuessRow = { tokens: [...state.currentInputTokens], evals };
    const newGuesses = [...state.submittedGuesses, row];
    const isWin = evals.every((e) => e === 'correct');
    const isLoss = !isWin && newGuesses.length >= MAX_ATTEMPTS;
    const status: GameStatus = isWin ? 'won' : isLoss ? 'lost' : 'playing';
    const letterStates = computeLetterStates(newGuesses);
    dispatch({ type: 'SUBMIT_SUCCESS', row, status, letterStates });

    if (status !== 'playing') {
      // Finalize: update stats, notify caller.
      const prevStats = await Storage.getStats();
      const nextStats = updateStatsOnFinish(
        prevStats,
        isWin,
        isWin ? newGuesses.length : null,
        state.today,
      );
      await Storage.setStats(nextStats);
      const yellowCount = countYellows(newGuesses.map((g) => g.evals));
      optionsRef.current.onFinish?.({
        solved: isWin,
        attempts: isWin ? newGuesses.length : null,
        yellowCount,
        word: state.solutionTokens.join(''),
        stats: nextStats,
      });
    }
  }, [state]);

  const revealRandomLetter = useCallback((): string | null => {
    if (state.status !== 'playing') return null;
    // Pick a solution letter that hasn't yet been shown as correct.
    const knownCorrect = new Set<number>();
    for (const row of state.submittedGuesses) {
      row.evals.forEach((e, idx) => {
        if (e === 'correct') knownCorrect.add(idx);
      });
    }
    const candidates: number[] = [];
    for (let i = 0; i < WORD_LENGTH; i += 1) {
      if (!knownCorrect.has(i)) candidates.push(i);
    }
    if (candidates.length === 0) return null;
    const pick = candidates[Math.floor(Math.random() * candidates.length)]!;
    return `Position ${pick + 1}: ${state.solutionTokens[pick]!.toUpperCase()}`;
  }, [state]);

  return useMemo(
    () => ({ state, pressLetter, pressBackspace, pressEnter, revealRandomLetter }),
    [state, pressLetter, pressBackspace, pressEnter, revealRandomLetter],
  );
}
