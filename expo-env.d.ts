/// <reference types="expo/types" />
/// <reference types="expo-router/types" />

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_SUPABASE_URL: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
    EXPO_PUBLIC_ADMOB_ANDROID_APP_ID: string;
    EXPO_PUBLIC_ADMOB_IOS_APP_ID: string;
    EXPO_PUBLIC_ADMOB_BANNER_ID: string;
    EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID: string;
    EXPO_PUBLIC_ADMOB_REWARDED_ID: string;
    EXPO_PUBLIC_IAP_REMOVE_ADS_ID: string;
    EXPO_PUBLIC_GOOGLE_AUTH_CLIENT_ID_IOS: string;
    EXPO_PUBLIC_GOOGLE_AUTH_CLIENT_ID_ANDROID: string;
    EXPO_PUBLIC_GOOGLE_AUTH_CLIENT_ID_WEB: string;
  }
}
