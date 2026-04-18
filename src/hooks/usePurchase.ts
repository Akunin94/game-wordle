import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as InAppPurchases from 'expo-in-app-purchases';
import { setAdFreeRemote } from '@/utils/supabase';

const REMOVE_ADS_PRODUCT_ID =
  process.env.EXPO_PUBLIC_IAP_REMOVE_ADS_ID || 'uz_wordle_remove_ads';

export interface Product {
  productId: string;
  title: string;
  description: string;
  priceString: string;
}

export type PurchaseStatus = 'idle' | 'loading' | 'success' | 'restored' | 'error';

export interface UsePurchaseOptions {
  /** Called with `true` once ad-free should be turned on (buy or restore). */
  onAdFreeUnlocked: () => Promise<void> | void;
  /** Current signed-in user id — used to mirror the entitlement to Supabase. */
  userId: string | null;
}

export interface UsePurchaseResult {
  product: Product | null;
  status: PurchaseStatus;
  error: string | null;
  purchaseRemoveAds: () => Promise<void>;
  restorePurchases: () => Promise<void>;
}

export function usePurchase(options: UsePurchaseOptions): UsePurchaseResult {
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<PurchaseStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Connect + fetch product on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await InAppPurchases.connectAsync();
        const { responseCode, results } = await InAppPurchases.getProductsAsync([
          REMOVE_ADS_PRODUCT_ID,
        ]);
        if (cancelled) return;
        if (
          responseCode === InAppPurchases.IAPResponseCode.OK &&
          results &&
          results.length > 0
        ) {
          const p = results[0]!;
          setProduct({
            productId: p.productId,
            title: p.title ?? 'Remove Ads',
            description: p.description ?? '',
            priceString: p.price ?? '$1.99',
          });
        }
      } catch (err) {
        console.warn('[iap] connect/getProducts failed', err);
      }
    })();

    // Global listener — fires for both buy and restore flows.
    InAppPurchases.setPurchaseListener(async ({ responseCode, results, errorCode }) => {
      if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
        for (const purchase of results) {
          if (purchase.productId !== REMOVE_ADS_PRODUCT_ID) continue;
          if (!purchase.acknowledged) {
            try {
              await InAppPurchases.finishTransactionAsync(purchase, false);
            } catch (err) {
              console.warn('[iap] finishTransaction failed', err);
            }
          }
          await optionsRef.current.onAdFreeUnlocked();
          if (optionsRef.current.userId) {
            await setAdFreeRemote(optionsRef.current.userId, true);
          }
          setStatus('success');
        }
      } else if (
        responseCode === InAppPurchases.IAPResponseCode.USER_CANCELED
      ) {
        setStatus('idle');
      } else {
        setStatus('error');
        setError(`Purchase failed (code ${errorCode ?? responseCode})`);
      }
    });

    return () => {
      cancelled = true;
      void InAppPurchases.disconnectAsync().catch(() => undefined);
    };
  }, []);

  const purchaseRemoveAds = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      await InAppPurchases.purchaseItemAsync(REMOVE_ADS_PRODUCT_ID);
      // The actual entitlement flip happens in the purchase listener.
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();
      if (responseCode !== InAppPurchases.IAPResponseCode.OK) {
        setStatus('error');
        setError('Unable to fetch purchase history');
        return;
      }
      const owned = (results ?? []).some(
        (p) => p.productId === REMOVE_ADS_PRODUCT_ID,
      );
      if (owned) {
        await optionsRef.current.onAdFreeUnlocked();
        if (optionsRef.current.userId) {
          await setAdFreeRemote(optionsRef.current.userId, true);
        }
        setStatus('restored');
      } else {
        setStatus('idle');
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  return useMemo(
    () => ({ product, status, error, purchaseRemoveAds, restorePurchases }),
    [product, status, error, purchaseRemoveAds, restorePurchases],
  );
}
