import { ANSWER_WORDS, VALID_GUESSES } from '@/data/words';

export type LetterEvaluation = 'correct' | 'present' | 'absent';

export const WORD_LENGTH = 5;
export const MAX_ATTEMPTS = 6;

/**
 * Tokenize an Uzbek word into an array of letter tokens, treating the
 * digraphs (sh, ch, ng) and apostrophe-letters (oʻ/o', gʻ/g') as a SINGLE
 * letter each. Accepts both straight apostrophe (') and the Unicode "Modifier
 * Letter Apostrophe" (ʻ, U+02BB) interchangeably — the canonical form inside
 * the game is the straight apostrophe.
 *
 * The input is lowercased before tokenization. Unknown characters are
 * emitted as individual tokens so that assertions catch them.
 */
export function tokenizeUzbek(raw: string): string[] {
  const s = raw
    .toLowerCase()
    .replace(/\u02bb/g, "'")
    .replace(/[\u2018\u2019]/g, "'");
  const tokens: string[] = [];
  let i = 0;
  while (i < s.length) {
    const two = s.slice(i, i + 2);
    if (two === "o'" || two === "g'" || two === 'sh' || two === 'ch' || two === 'ng') {
      tokens.push(two);
      i += 2;
      continue;
    }
    tokens.push(s[i]!);
    i += 1;
  }
  return tokens;
}

/**
 * Evaluate a guess against the solution using standard Wordle semantics.
 * Both arguments must already be letter-tokenized to length WORD_LENGTH.
 *
 * Correct-position letters are locked first, then present-but-misplaced
 * letters consume remaining occurrences in left-to-right order, so repeat
 * letters degrade gracefully (classic Wordle behavior).
 */
export function evaluateGuess(
  guessTokens: readonly string[],
  solutionTokens: readonly string[],
): LetterEvaluation[] {
  if (guessTokens.length !== WORD_LENGTH || solutionTokens.length !== WORD_LENGTH) {
    throw new Error(
      `evaluateGuess requires ${WORD_LENGTH}-token inputs; got ${guessTokens.length} / ${solutionTokens.length}`,
    );
  }

  const result: LetterEvaluation[] = new Array(WORD_LENGTH).fill('absent');
  const remaining: (string | null)[] = [...solutionTokens];

  // Pass 1: greens.
  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (guessTokens[i] === solutionTokens[i]) {
      result[i] = 'correct';
      remaining[i] = null;
    }
  }

  // Pass 2: yellows.
  for (let i = 0; i < WORD_LENGTH; i += 1) {
    if (result[i] === 'correct') continue;
    const token = guessTokens[i]!;
    const matchIndex = remaining.findIndex((t) => t === token);
    if (matchIndex >= 0) {
      result[i] = 'present';
      remaining[matchIndex] = null;
    }
  }

  return result;
}

/**
 * Deterministic daily-word selection. Uses UTC midnight as the day boundary
 * so every user on the planet sees the same answer for a given calendar day
 * (aligned with UTC — simplest and works without server sync).
 */
const EPOCH_UTC_MS = Date.UTC(2025, 0, 1); // 2025-01-01 UTC

export function getDailyIndex(now: Date = new Date()): number {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dayIndex = Math.floor((today - EPOCH_UTC_MS) / 86_400_000);
  const len = ANSWER_WORDS.length;
  // Safe positive modulo (handles dates before the epoch gracefully).
  return ((dayIndex % len) + len) % len;
}

export function getDailyWord(now: Date = new Date()): string {
  return ANSWER_WORDS[getDailyIndex(now)]!;
}

/**
 * ISO date string for the current day in UTC: "YYYY-MM-DD". Used as the
 * AsyncStorage / Supabase key to prevent replaying the same day.
 */
export function getTodayIso(now: Date = new Date()): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Precomputed Set for O(1) membership checks.
const VALID_WORDS_SET: ReadonlySet<string> = new Set<string>([
  ...ANSWER_WORDS,
  ...VALID_GUESSES,
]);

export function isValidWord(word: string): boolean {
  const tokens = tokenizeUzbek(word);
  if (tokens.length !== WORD_LENGTH) return false;
  return VALID_WORDS_SET.has(tokens.join(''));
}

/**
 * Does this guess satisfy "hard mode" — all previously revealed hints must be
 * reused in this guess? The rules:
 *   - every green letter must remain in the same position
 *   - every yellow letter must appear somewhere in the guess
 */
export function satisfiesHardMode(
  guessTokens: readonly string[],
  previousGuesses: readonly { tokens: readonly string[]; evals: readonly LetterEvaluation[] }[],
): { ok: true } | { ok: false; reason: string } {
  for (const prev of previousGuesses) {
    for (let i = 0; i < WORD_LENGTH; i += 1) {
      if (prev.evals[i] === 'correct' && prev.tokens[i] !== guessTokens[i]) {
        return {
          ok: false,
          reason: `Position ${i + 1} must be "${prev.tokens[i]!.toUpperCase()}"`,
        };
      }
    }
    const needed: string[] = [];
    for (let i = 0; i < WORD_LENGTH; i += 1) {
      if (prev.evals[i] === 'present') needed.push(prev.tokens[i]!);
    }
    const remaining = [...guessTokens];
    for (const letter of needed) {
      const idx = remaining.indexOf(letter);
      if (idx === -1) {
        return { ok: false, reason: `Guess must contain "${letter.toUpperCase()}"` };
      }
      remaining[idx] = '__used__';
    }
  }
  return { ok: true };
}

/**
 * Count how many "present" (yellow) evaluations occurred across a set of
 * already-finished guesses — fuels the `no_yellow` achievement.
 */
export function countYellows(
  guessEvals: readonly (readonly LetterEvaluation[])[],
): number {
  let count = 0;
  for (const row of guessEvals) {
    for (const e of row) if (e === 'present') count += 1;
  }
  return count;
}
