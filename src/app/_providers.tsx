import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { useAuth, UseAuthResult } from '@/hooks/useAuth';
import { useAds, UseAdsResult } from '@/hooks/useAds';
import { usePurchase, UsePurchaseResult } from '@/hooks/usePurchase';
import { useSettings, UseSettingsResult } from '@/hooks/useSettings';
import { useAchievements, UseAchievementsResult } from '@/hooks/useAchievements';
import type { Locale } from '@/utils/i18n';
import { t as translate } from '@/utils/i18n';
import type { ThemeTokens } from '@/constants/colors';

interface AppContextValue extends UseSettingsResult {
  auth: UseAuthResult;
  ads: UseAdsResult;
  purchase: UsePurchaseResult;
  achievements: UseAchievementsResult;
  t: (key: Parameters<typeof translate>[1]) => string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: PropsWithChildren) {
  const settings = useSettings();
  const auth = useAuth();
  const ads = useAds();
  const achievements = useAchievements(auth.user?.id ?? null);

  const onAdFreeUnlocked = useCallback(async () => {
    await ads.setAdFree(true);
  }, [ads]);

  const purchase = usePurchase({
    userId: auth.user?.id ?? null,
    onAdFreeUnlocked,
  });

  const value = useMemo<AppContextValue>(
    () => ({
      ...settings,
      auth,
      ads,
      purchase,
      achievements,
      t: (key) => translate(settings.locale, key),
    }),
    [settings, auth, ads, purchase, achievements],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used inside <AppProvider>');
  }
  return ctx;
}

// Convenience selectors
export function useLocale(): Locale {
  return useAppContext().locale;
}
export function useTheme(): ThemeTokens {
  return useAppContext().theme;
}
