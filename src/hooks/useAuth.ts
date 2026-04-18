import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { supabase, upsertUser, UserRow } from '@/utils/supabase';

WebBrowser.maybeCompleteAuthSession();

export interface AuthUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  isAdFree: boolean;
}

export interface UseAuthResult {
  user: AuthUser | null;
  loading: boolean;
  canUseApple: boolean;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

function rowToAuthUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    isAdFree: row.is_ad_free,
  };
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [canUseApple, setCanUseApple] = useState(false);

  const [, googleResponse, promptGoogle] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_AUTH_CLIENT_ID_IOS,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_AUTH_CLIENT_ID_ANDROID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_AUTH_CLIENT_ID_WEB,
  });

  const loadSession = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    const sUser = data.session?.user;
    if (!sUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    const row = await upsertUser({
      id: sUser.id,
      display_name:
        (sUser.user_metadata?.['full_name'] as string | undefined) ??
        (sUser.user_metadata?.['name'] as string | undefined) ??
        (sUser.email?.split('@')[0] as string | undefined) ??
        'Oʻyinchi',
      avatar_url:
        (sUser.user_metadata?.['avatar_url'] as string | undefined) ?? null,
    });
    setUser(row ? rowToAuthUser(row) : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadSession();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void loadSession();
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, [loadSession]);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      void AppleAuthentication.isAvailableAsync().then(setCanUseApple);
    }
  }, []);

  // Handle Google OAuth response.
  useEffect(() => {
    if (googleResponse?.type !== 'success') return;
    const idToken =
      googleResponse.params['id_token'] ?? googleResponse.authentication?.idToken;
    if (!idToken) return;
    void supabase.auth
      .signInWithIdToken({ provider: 'google', token: idToken })
      .then(({ error }) => {
        if (error) console.warn('[auth] google signInWithIdToken failed', error.message);
      });
  }, [googleResponse]);

  const signInWithApple = useCallback(async () => {
    if (Platform.OS !== 'ios') return;
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) return;
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (error) console.warn('[auth] apple signInWithIdToken failed', error.message);
    } catch (err) {
      const anyErr = err as { code?: string };
      if (anyErr.code === 'ERR_CANCELED') return;
      console.warn('[auth] apple sign-in error', err);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      await promptGoogle();
    } catch (err) {
      console.warn('[auth] google sign-in error', err);
    }
  }, [promptGoogle]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return useMemo(
    () => ({
      user,
      loading,
      canUseApple,
      signInWithApple,
      signInWithGoogle,
      signOut,
      refresh: loadSession,
    }),
    [user, loading, canUseApple, signInWithApple, signInWithGoogle, signOut, loadSession],
  );
}

