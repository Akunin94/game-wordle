/**
 * Theme tokens. Three palettes are supported:
 *   - light       (default)
 *   - dark        (user toggle in Settings)
 *   - colorblind  (alternative palette; works in both light and dark)
 *
 * The colorblind palette keeps high contrast between "correct" and "present"
 * by swapping the usual green/yellow for blue/orange (Ishihara-safe).
 */

export type TileState = 'correct' | 'present' | 'absent' | 'empty' | 'filled';

export interface ThemeTokens {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  keyDefault: string;
  keyText: string;
  correct: string;
  present: string;
  absent: string;
  accent: string;
  danger: string;
  toast: string;
  toastText: string;
}

const LIGHT: ThemeTokens = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#1A1A1B',
  textMuted: '#787C7E',
  border: '#D3D6DA',
  borderStrong: '#878A8C',
  keyDefault: '#D3D6DA',
  keyText: '#1A1A1B',
  correct: '#6AAA64',
  present: '#C9B458',
  absent: '#787C7E',
  accent: '#1A73E8',
  danger: '#D93025',
  toast: '#1A1A1B',
  toastText: '#FFFFFF',
};

const DARK: ThemeTokens = {
  background: '#121213',
  surface: '#1E1E1F',
  text: '#FFFFFF',
  textMuted: '#818384',
  border: '#3A3A3C',
  borderStrong: '#565758',
  keyDefault: '#818384',
  keyText: '#FFFFFF',
  correct: '#538D4E',
  present: '#B59F3B',
  absent: '#3A3A3C',
  accent: '#8AB4F8',
  danger: '#F28B82',
  toast: '#FFFFFF',
  toastText: '#1A1A1B',
};

const LIGHT_COLORBLIND: ThemeTokens = {
  ...LIGHT,
  correct: '#1E88E5', // blue
  present: '#F5A623', // orange
};

const DARK_COLORBLIND: ThemeTokens = {
  ...DARK,
  correct: '#85C1FF',
  present: '#F5A623',
};

export function getTheme(options: {
  dark: boolean;
  colorblind: boolean;
}): ThemeTokens {
  if (options.dark && options.colorblind) return DARK_COLORBLIND;
  if (options.dark) return DARK;
  if (options.colorblind) return LIGHT_COLORBLIND;
  return LIGHT;
}

export function tileColor(
  theme: ThemeTokens,
  state: TileState,
): { bg: string; border: string; text: string } {
  switch (state) {
    case 'correct':
      return { bg: theme.correct, border: theme.correct, text: '#FFFFFF' };
    case 'present':
      return { bg: theme.present, border: theme.present, text: '#FFFFFF' };
    case 'absent':
      return { bg: theme.absent, border: theme.absent, text: '#FFFFFF' };
    case 'filled':
      return {
        bg: theme.background,
        border: theme.borderStrong,
        text: theme.text,
      };
    case 'empty':
    default:
      return {
        bg: theme.background,
        border: theme.border,
        text: theme.text,
      };
  }
}
