/**
 * On-screen Uzbek keyboard layout.
 *
 * Row 1: QWERTYUIOP
 * Row 2:  ASDFGHJKL
 * Row 3:  [⌫] ZXCVBNM [↵]
 * Row 4 (special Uzbek digraphs / apostrophe letters): O' G' Sh Ch Ng
 *
 * Each key is a "letter token": the value inserted into the current guess
 * when the key is pressed. Digraph letters are inserted as a single logical
 * letter (see tokenizeUzbek in utils/gameLogic).
 */

export type KeyAction =
  | { kind: 'letter'; value: string; display: string }
  | { kind: 'enter' }
  | { kind: 'backspace' };

type KeyboardRow = readonly KeyAction[];

const letter = (value: string, display?: string): KeyAction => ({
  kind: 'letter',
  value,
  display: display ?? value.toUpperCase(),
});

export const KEYBOARD_LAYOUT: readonly KeyboardRow[] = [
  [
    letter('q'),
    letter('w'),
    letter('e'),
    letter('r'),
    letter('t'),
    letter('y'),
    letter('u'),
    letter('i'),
    letter('o'),
    letter('p'),
  ],
  [
    letter('a'),
    letter('s'),
    letter('d'),
    letter('f'),
    letter('g'),
    letter('h'),
    letter('j'),
    letter('k'),
    letter('l'),
  ],
  [
    { kind: 'backspace' },
    letter('z'),
    letter('x'),
    letter('c'),
    letter('v'),
    letter('b'),
    letter('n'),
    letter('m'),
    { kind: 'enter' },
  ],
  [
    // Special Uzbek letters — each is a single tile.
    letter("o'", "O'"),
    letter("g'", "G'"),
    letter('sh', 'Sh'),
    letter('ch', 'Ch'),
    letter('ng', 'Ng'),
  ],
];

/**
 * The full ordered alphabet of letter tokens, for mapping keyboard key state.
 */
export const ALL_LETTER_TOKENS: readonly string[] = [
  'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
  'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
  'z', 'x', 'c', 'v', 'b', 'n', 'm',
  "o'", "g'", 'sh', 'ch', 'ng',
];
