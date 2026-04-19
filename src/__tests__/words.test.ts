/**
 * Sanity checks for src/data/words.ts
 *
 * These tests guard the invariants that the game logic relies on:
 * - all words are exactly 5 ASCII lowercase letters
 * - no word appears in both ANSWER_WORDS and VALID_GUESSES
 * - no duplicates within either array
 */

import { ANSWER_WORDS, VALID_GUESSES } from '@/data/words';

describe('ANSWER_WORDS', () => {
  it('is non-empty', () => {
    expect(ANSWER_WORDS.length).toBeGreaterThan(0);
  });

  it('every entry is exactly 5 lowercase ASCII letters', () => {
    for (const word of ANSWER_WORDS) {
      expect(word).toMatch(/^[a-z]{5}$/);
    }
  });

  it('has no duplicate entries', () => {
    const unique = new Set(ANSWER_WORDS);
    expect(unique.size).toBe(ANSWER_WORDS.length);
  });
});

describe('VALID_GUESSES', () => {
  it('is non-empty', () => {
    expect(VALID_GUESSES.length).toBeGreaterThan(0);
  });

  it('every entry is exactly 5 lowercase ASCII letters', () => {
    for (const word of VALID_GUESSES) {
      expect(word).toMatch(/^[a-z]{5}$/);
    }
  });

  it('has no duplicate entries', () => {
    const unique = new Set(VALID_GUESSES);
    expect(unique.size).toBe(VALID_GUESSES.length);
  });
});

describe('ANSWER_WORDS ∩ VALID_GUESSES', () => {
  it('has no overlap between the two lists', () => {
    const answerSet = new Set(ANSWER_WORDS);
    const overlapping = VALID_GUESSES.filter((w) => answerSet.has(w));
    expect(overlapping).toEqual([]);
  });
});
