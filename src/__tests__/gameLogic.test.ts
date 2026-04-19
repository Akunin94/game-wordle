/**
 * Unit tests for src/utils/gameLogic.ts
 *
 * These tests intentionally do NOT depend on ANSWER_WORDS length so they stay
 * green as the word list evolves.
 */

import {
  tokenizeUzbek,
  evaluateGuess,
  getDailyIndex,
  satisfiesHardMode,
  countYellows,
  WORD_LENGTH,
} from '@/utils/gameLogic';
import { ANSWER_WORDS } from '@/data/words';

// ─── tokenizeUzbek ───────────────────────────────────────────────────────────

describe('tokenizeUzbek', () => {
  it('tokenises a plain ASCII word character-by-character', () => {
    expect(tokenizeUzbek('kitob')).toEqual(['k', 'i', 't', 'o', 'b']);
  });

  it('treats "sh" as a single token', () => {
    expect(tokenizeUzbek('shahar')).toEqual(['sh', 'a', 'h', 'a', 'r']);
  });

  it('treats "ch" as a single token', () => {
    expect(tokenizeUzbek('chora')).toEqual(['ch', 'o', 'r', 'a']);
  });

  it('treats "ng" as a single token', () => {
    expect(tokenizeUzbek('tonga')).toEqual(['t', 'o', 'ng', 'a']);
  });

  it("treats \"o'\" as a single token (straight apostrophe)", () => {
    expect(tokenizeUzbek("o'tin")).toEqual(["o'", 't', 'i', 'n']);
  });

  it("treats \"g'\" as a single token (straight apostrophe)", () => {
    expect(tokenizeUzbek("g'oya")).toEqual(["g'", 'o', 'y', 'a']);
  });

  it('normalises Unicode modifier-letter apostrophe (U+02BB) to straight apostrophe', () => {
    // ʻ = U+02BB
    expect(tokenizeUzbek('o\u02bbtin')).toEqual(["o'", 't', 'i', 'n']);
  });

  it('lowercases the input before tokenising', () => {
    expect(tokenizeUzbek('KITOB')).toEqual(['k', 'i', 't', 'o', 'b']);
  });
});

// ─── evaluateGuess ───────────────────────────────────────────────────────────

describe('evaluateGuess', () => {
  it('returns all "correct" when guess === solution', () => {
    const tokens = ['k', 'i', 't', 'o', 'b'];
    expect(evaluateGuess(tokens, tokens)).toEqual([
      'correct', 'correct', 'correct', 'correct', 'correct',
    ]);
  });

  it('returns all "absent" when no letters match', () => {
    expect(evaluateGuess(
      ['a', 'b', 'c', 'd', 'e'],
      ['f', 'g', 'h', 'i', 'j'],
    )).toEqual(['absent', 'absent', 'absent', 'absent', 'absent']);
  });

  it('marks a letter "present" when it exists in the wrong position', () => {
    // solution: k-i-t-o-b, guess: b-k-z-z-z
    const result = evaluateGuess(['b', 'k', 'z', 'z', 'z'], ['k', 'i', 't', 'o', 'b']);
    expect(result[0]).toBe('present'); // 'b' is in solution but not at index 0
    expect(result[1]).toBe('present'); // 'k' is in solution but not at index 1
    expect(result[2]).toBe('absent');
    expect(result[3]).toBe('absent');
    expect(result[4]).toBe('absent');
  });

  it('handles duplicate letters: extra copies should be "absent"', () => {
    // solution: b-o-z-o-r, guess: o-o-o-o-o
    // only 2 'o's in solution → first two get 'present'/'correct', rest 'absent'
    const result = evaluateGuess(['o', 'o', 'o', 'o', 'o'], ['b', 'o', 'z', 'o', 'r']);
    // index 1 → correct; index 3 → correct; index 0,2,4 → absent
    expect(result[1]).toBe('correct');
    expect(result[3]).toBe('correct');
    expect(result[0]).toBe('absent');
    expect(result[2]).toBe('absent');
    expect(result[4]).toBe('absent');
  });

  it('throws if inputs have wrong length', () => {
    expect(() => evaluateGuess(['a', 'b'], ['a', 'b', 'c', 'd', 'e'])).toThrow();
  });
});

// ─── getDailyIndex ───────────────────────────────────────────────────────────

describe('getDailyIndex', () => {
  const len = ANSWER_WORDS.length;

  it('returns 0 for the epoch date 2025-01-01 UTC', () => {
    expect(getDailyIndex(new Date('2025-01-01T00:00:00Z'))).toBe(0);
  });

  it('returns 7 % len for 2025-01-08 UTC', () => {
    expect(getDailyIndex(new Date('2025-01-08T00:00:00Z'))).toBe(7 % len);
  });

  it('returns a non-negative index for dates before the epoch', () => {
    const idx = getDailyIndex(new Date('2024-12-31T00:00:00Z'));
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(len);
  });

  it('wraps around after len days', () => {
    const d = new Date(Date.UTC(2025, 0, 1) + len * 86_400_000);
    expect(getDailyIndex(d)).toBe(0);
  });
});

// ─── satisfiesHardMode ───────────────────────────────────────────────────────

describe('satisfiesHardMode', () => {
  const solution: string[] = ['k', 'i', 't', 'o', 'b'];

  it('passes when there are no previous guesses', () => {
    expect(satisfiesHardMode(['a', 'b', 'c', 'd', 'e'], [])).toEqual({ ok: true });
  });

  it('passes when all greens are reused in the same position', () => {
    const prev = {
      tokens: ['k', 'z', 'z', 'z', 'z'] as string[],
      evals: evaluateGuess(['k', 'z', 'z', 'z', 'z'], solution),
    };
    // next guess keeps 'k' at index 0
    expect(satisfiesHardMode(['k', 'i', 'a', 'a', 'a'], [prev])).toEqual({ ok: true });
  });

  it('fails when a green letter is ignored', () => {
    const prev = {
      tokens: ['k', 'z', 'z', 'z', 'z'] as string[],
      evals: evaluateGuess(['k', 'z', 'z', 'z', 'z'], solution),
    };
    const r = satisfiesHardMode(['a', 'a', 'a', 'a', 'a'], [prev]);
    expect(r.ok).toBe(false);
  });

  it('fails when a yellow letter is not included in the next guess', () => {
    // 'i' at position 0 is yellow (present but wrong place)
    const prev = {
      tokens: ['i', 'z', 'z', 'z', 'z'] as string[],
      evals: evaluateGuess(['i', 'z', 'z', 'z', 'z'], solution),
    };
    const r = satisfiesHardMode(['a', 'a', 'a', 'a', 'a'], [prev]);
    expect(r.ok).toBe(false);
  });
});

// ─── countYellows ────────────────────────────────────────────────────────────

describe('countYellows', () => {
  it('returns 0 with no guesses', () => {
    expect(countYellows([])).toBe(0);
  });

  it('counts "present" evaluations across all rows', () => {
    const row1 = ['correct', 'present', 'absent', 'absent', 'absent'] as const;
    const row2 = ['absent', 'present', 'present', 'absent', 'correct'] as const;
    expect(countYellows([row1, row2])).toBe(3);
  });

  it('does not count "correct" or "absent" as yellows', () => {
    const row = ['correct', 'correct', 'absent', 'absent', 'absent'] as const;
    expect(countYellows([row])).toBe(0);
  });
});

// ─── WORD_LENGTH constant ────────────────────────────────────────────────────

describe('WORD_LENGTH', () => {
  it('equals 5', () => {
    expect(WORD_LENGTH).toBe(5);
  });
});
