import { useCallback, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { DEFAULT_SETTINGS, Storage, StoredSettings } from '@/utils/storage';
import { getTheme, ThemeTokens } from '@/constants/colors';
import { Locale } from '@/utils/i18n';

export interface UseSettingsResult {
  settings: StoredSettings;
  theme: ThemeTokens;
  isDark: boolean;
  locale: Locale;
  setDarkMode: (value: boolean | null) => Promise<void>;
  setColorblind: (value: boolean) => Promise<void>;
  setHardMode: (value: boolean) => Promise<void>;
  setLanguage: (value: Locale) => Promise<void>;
  hydrated: boolean;
}

export function useSettings(): UseSettingsResult {
  const system = useColorScheme();
  const [settings, setSettings] = useState<StoredSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await Storage.getSettings();
      if (cancelled) return;
      setSettings(s);
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: StoredSettings) => {
    setSettings(next);
    await Storage.setSettings(next);
  }, []);

  const isDark = settings.darkMode ?? system === 'dark';
  const theme = useMemo(
    () => getTheme({ dark: isDark, colorblind: settings.colorblind }),
    [isDark, settings.colorblind],
  );

  const setDarkMode = useCallback(
    (value: boolean | null) => persist({ ...settings, darkMode: value }),
    [settings, persist],
  );
  const setColorblind = useCallback(
    (value: boolean) => persist({ ...settings, colorblind: value }),
    [settings, persist],
  );
  const setHardMode = useCallback(
    (value: boolean) => persist({ ...settings, hardMode: value }),
    [settings, persist],
  );
  const setLanguage = useCallback(
    (value: Locale) => persist({ ...settings, language: value }),
    [settings, persist],
  );

  return useMemo(
    () => ({
      settings,
      theme,
      isDark,
      locale: settings.language,
      setDarkMode,
      setColorblind,
      setHardMode,
      setLanguage,
      hydrated,
    }),
    [settings, theme, isDark, setDarkMode, setColorblind, setHardMode, setLanguage, hydrated],
  );
}
