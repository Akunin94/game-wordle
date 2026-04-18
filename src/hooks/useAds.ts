import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import mobileAds, {
  AdEventType,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { Storage } from '@/utils/storage';

const INTERSTITIAL_FREQUENCY = 3;

function resolveId(prodId: string | undefined, testId: string): string {
  if (__DEV__ || !prodId) return testId;
  return prodId;
}

export interface UseAdsResult {
  isAdFree: boolean;
  setAdFree: (value: boolean) => Promise<void>;
  bannerUnitId: string;
  /**
   * Record that a game just finished; show an interstitial if this is every
   * 3rd completed game. No-op when ad-free.
   */
  recordGameFinished: () => Promise<void>;
  /**
   * Show a rewarded ad. Resolves with true if the user earned the reward.
   */
  showRewarded: () => Promise<boolean>;
}

export function useAds(): UseAdsResult {
  const [isAdFree, setIsAdFree] = useState(false);
  const interstitialRef = useRef<InterstitialAd | null>(null);
  const rewardedRef = useRef<RewardedAd | null>(null);
  const interstitialLoadedRef = useRef(false);
  const rewardedLoadedRef = useRef(false);

  const interstitialUnitId = useMemo(
    () =>
      resolveId(
        process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID,
        TestIds.INTERSTITIAL,
      ),
    [],
  );
  const rewardedUnitId = useMemo(
    () =>
      resolveId(process.env.EXPO_PUBLIC_ADMOB_REWARDED_ID, TestIds.REWARDED),
    [],
  );
  const bannerUnitId = useMemo(
    () => resolveId(process.env.EXPO_PUBLIC_ADMOB_BANNER_ID, TestIds.BANNER),
    [],
  );

  // Load ad-free flag from storage on mount.
  useEffect(() => {
    void Storage.getAdFree().then(setIsAdFree);
  }, []);

  // Initialize SDK + preload interstitial & rewarded.
  useEffect(() => {
    if (isAdFree) return;
    let cancelled = false;

    void mobileAds()
      .initialize()
      .catch((err) => console.warn('[ads] initialize failed', err));

    const interstitial = InterstitialAd.createForAdRequest(interstitialUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });
    const loadedSub = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      if (!cancelled) interstitialLoadedRef.current = true;
    });
    const closedSub = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      interstitialLoadedRef.current = false;
      interstitial.load();
    });
    const errorSub = interstitial.addAdEventListener(AdEventType.ERROR, (err) => {
      console.warn('[ads] interstitial error', err);
      interstitialLoadedRef.current = false;
    });
    interstitial.load();
    interstitialRef.current = interstitial;

    const rewarded = RewardedAd.createForAdRequest(rewardedUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });
    const rLoadedSub = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        if (!cancelled) rewardedLoadedRef.current = true;
      },
    );
    const rClosedSub = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      rewardedLoadedRef.current = false;
      rewarded.load();
    });
    const rErrorSub = rewarded.addAdEventListener(AdEventType.ERROR, (err) => {
      console.warn('[ads] rewarded error', err);
      rewardedLoadedRef.current = false;
    });
    rewarded.load();
    rewardedRef.current = rewarded;

    return () => {
      cancelled = true;
      loadedSub();
      closedSub();
      errorSub();
      rLoadedSub();
      rClosedSub();
      rErrorSub();
    };
  }, [isAdFree, interstitialUnitId, rewardedUnitId]);

  const setAdFree = useCallback(async (value: boolean) => {
    setIsAdFree(value);
    await Storage.setAdFree(value);
  }, []);

  const recordGameFinished = useCallback(async () => {
    if (isAdFree) return;
    const prev = await Storage.getGamesSinceInterstitial();
    const next = prev + 1;
    if (next >= INTERSTITIAL_FREQUENCY && interstitialLoadedRef.current) {
      try {
        interstitialRef.current?.show();
        await Storage.setGamesSinceInterstitial(0);
      } catch (err) {
        console.warn('[ads] interstitial show failed', err);
        await Storage.setGamesSinceInterstitial(next);
      }
    } else {
      await Storage.setGamesSinceInterstitial(next);
    }
  }, [isAdFree]);

  const showRewarded = useCallback(async (): Promise<boolean> => {
    if (isAdFree) return true; // ad-free users get the reward for free
    if (!rewardedLoadedRef.current || !rewardedRef.current) return false;
    return new Promise<boolean>((resolve) => {
      const ad = rewardedRef.current!;
      let earned = false;
      const earnSub = ad.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          earned = true;
        },
      );
      const closeSub = ad.addAdEventListener(AdEventType.CLOSED, () => {
        earnSub();
        closeSub();
        resolve(earned);
      });
      const errorSub = ad.addAdEventListener(AdEventType.ERROR, () => {
        earnSub();
        closeSub();
        errorSub();
        resolve(false);
      });
      try {
        ad.show();
      } catch (err) {
        console.warn('[ads] rewarded show failed', err);
        resolve(false);
      }
    });
  }, [isAdFree]);

  return useMemo(
    () => ({
      isAdFree,
      setAdFree,
      bannerUnitId,
      recordGameFinished,
      showRewarded,
    }),
    [isAdFree, setAdFree, bannerUnitId, recordGameFinished, showRewarded],
  );
}
