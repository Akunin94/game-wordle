# Uzbek Wordle

Uzbek-language Wordle for iOS and Android, built with React Native + Expo (managed workflow).

- **6 attempts** to guess a hidden 5-letter Uzbek word (Latin script)
- **One game per day** — all users worldwide see the same word (UTC day boundary)
- **Global leaderboard** and **12 achievements** via Supabase
- **Sign in with Apple** and **Google Sign-In**
- Full **offline play** (AsyncStorage); leaderboard + achievements sync when online
- Monetized with **AdMob** (banner + interstitial + rewarded) and a non-consumable **Remove Ads** IAP
- **TypeScript strict** mode throughout, hooks + functional components only, React Native Animated API for every animation

## Project layout

```
games/wordle/
├── app.json
├── babel.config.js
├── eas.json
├── package.json
├── tsconfig.json
├── .env.example
├── supabase/
│   └── migrations/001_initial.sql
└── src/
    ├── app/                 expo-router screens
    │   ├── _layout.tsx
    │   ├── _providers.tsx
    │   ├── index.tsx        game screen
    │   ├── leaderboard.tsx
    │   ├── profile.tsx
    │   └── settings.tsx
    ├── components/          Board, Row, Tile, Keyboard, Modal, AdBanner, AchievementToast, Toast
    ├── constants/           colors.ts, keyboard.ts
    ├── data/                words.ts, achievements.ts
    ├── hooks/               useGame, useAuth, useAchievements, useAds, usePurchase, useSettings
    └── utils/               gameLogic.ts, storage.ts, supabase.ts, i18n.ts
```

## 1. Setup

Requires Node 20+, npm 10+, an Expo account, and the EAS CLI:

```bash
cd games/wordle
npm install
cp .env.example .env
# Then fill in Supabase URL + anon key, AdMob IDs, and OAuth client IDs.
npx eas login
npx eas build:configure
```

### Environment variables

| Variable | Purpose |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL`             | Your project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY`        | Anonymous key (safe to ship) |
| `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID`     | `ca-app-pub-…~…` Android App ID |
| `EXPO_PUBLIC_ADMOB_IOS_APP_ID`         | `ca-app-pub-…~…` iOS App ID |
| `EXPO_PUBLIC_ADMOB_BANNER_ID`          | Banner unit ID |
| `EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID`    | Interstitial unit ID |
| `EXPO_PUBLIC_ADMOB_REWARDED_ID`        | Rewarded unit ID (for the "reveal a letter" hint) |
| `EXPO_PUBLIC_IAP_REMOVE_ADS_ID`        | Product ID, default `uz_wordle_remove_ads` |
| `EXPO_PUBLIC_GOOGLE_AUTH_CLIENT_ID_IOS`     | Google OAuth client (iOS) |
| `EXPO_PUBLIC_GOOGLE_AUTH_CLIENT_ID_ANDROID` | Google OAuth client (Android) |
| `EXPO_PUBLIC_GOOGLE_AUTH_CLIENT_ID_WEB`     | Google OAuth client (web, used by expo-auth-session) |

When any AdMob ID is missing in development, the app falls back to Google's test ad unit IDs — safe to click on without generating invalid traffic. The real IDs are picked up only in production builds.

When any Supabase env var is missing the leaderboard and achievement-sync features degrade to local-only (the game itself keeps working).

## 2. Supabase setup

1. Create a new Supabase project.
2. Enable **Apple** and **Google** providers under *Authentication → Providers* (bundle IDs / client IDs you use for native sign-in).
3. Open *SQL Editor* and run the contents of `supabase/migrations/001_initial.sql`. This creates `users`, `daily_results`, `achievements`, the `leaderboard_summary` view, and enables RLS.
4. Verify that RLS is ON for all three tables (*Authentication → Policies*).
5. Copy the project URL + anon key into `.env` as `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

## 3. EAS Build

Android:

```bash
npx eas build --platform android --profile production
# Internal testing build:
npx eas build --platform android --profile preview
```

iOS:

```bash
npx eas build --platform ios --profile production
# Simulator build (fastest feedback while iterating):
npx eas build --platform ios --profile preview
```

Submission:

```bash
npx eas submit --platform android  # uploads to Google Play Console
npx eas submit --platform ios      # uploads to App Store Connect
```

Before submitting, update these in `app.json`:

- `expo.ios.bundleIdentifier` (currently `com.route4me.uzbekwordle`)
- `expo.android.package`
- `expo.extra.eas.projectId`
- The AdMob placeholder App IDs (`ca-app-pub-0000…~0000…`) in the `react-native-google-mobile-ads` plugin block — these **must** be real App IDs or the app will not boot.

## 4. AdMob setup

1. Sign in at <https://admob.google.com>.
2. Create two apps (iOS + Android) pointing to your bundle ID / package name.
3. Create three ad units per app: Banner, Interstitial, Rewarded.
4. Paste the resulting IDs into `.env` (`EXPO_PUBLIC_ADMOB_*`) and into `app.json` under the `react-native-google-mobile-ads` plugin (App IDs only).
5. Configure test devices via the AdMob dashboard before shipping.

Banner placement: bottom of the game screen, hidden when `isAdFree` is true.
Interstitial frequency: every 3rd completed game (controlled in `useAds.ts`).
Rewarded usage: `useGame.revealRandomLetter()` exposes a hint that can be gated behind `ads.showRewarded()`; wire it into the UI when you want to enable the "watch an ad to reveal one letter" flow.

## 5. In-App Purchase — Remove Ads

### App Store Connect (iOS)

1. *My Apps → <app> → Monetization → In-App Purchases* → **+**.
2. Type: **Non-Consumable**.
3. Product ID: `uz_wordle_remove_ads` (must match `EXPO_PUBLIC_IAP_REMOVE_ADS_ID`).
4. Reference name: "Remove Ads".
5. Price tier: Tier 2 (≈ $1.99).
6. Localization: Uzbek / Russian / English display name + description.
7. Upload a screenshot of where the purchase is offered (Settings screen).
8. Submit for review along with a build.
9. Ensure the app has a visible **Restore Purchases** button — this is required by App Review Guideline 3.1.1 and is already wired into *Settings*.

### Google Play Console (Android)

1. *Monetize → Products → In-app products* → **Create product**.
2. Product ID: `uz_wordle_remove_ads`.
3. Name / description for all locales.
4. Price: $1.99 (or local equivalent).
5. **Activate** the product.
6. Upload a signed release track build (Internal testing at minimum) so Play can read the manifest permissions.

## 6. Updating the word list

All daily answers and accepted guesses live in `src/data/words.ts`. The file exports two arrays:

- `ANSWER_WORDS` — daily-answer pool (currently ~200 curated entries)
- `VALID_GUESSES` — additional accepted guesses

Rules:

- Every word must be **exactly 5 characters of pure ASCII Latin** (a–z). No apostrophes, no digraphs in the shipped list. The tokenizer in `utils/gameLogic.ts` *supports* Uzbek digraphs (`sh`, `ch`, `ng`, `oʻ`, `gʻ`) as single logical letters, but the shipping lists avoid them to keep tile rendering consistent across platforms.
- Words must be real Uzbek words. The initial list was compiled quickly; **run it past a native speaker before publishing to the store.**
- Remove anything ambiguous, inflected forms, or rude terms.
- `assertWordsValid()` (also exported from `words.ts`) hard-checks the format and can be wired into a CI unit test.

The daily-word index is `Math.floor((today_utc - 2025-01-01_utc) / 86400000) mod ANSWER_WORDS.length`, so simply re-ordering the array will shift which word is shown on which day. Add new entries at the **end** of the array to keep historical days stable.

## 7. Running locally

```bash
# Dev Client + Metro
npm run start
# Press i / a to launch iOS simulator / Android emulator
```

Note: in-app purchases and Google Mobile Ads native modules do not work in Expo Go. Use a custom development client:

```bash
npx eas build --profile development --platform ios
npx eas build --profile development --platform android
```

## 8. Scripts

| `npm run …` | Effect |
| --- | --- |
| `start`      | Expo dev server |
| `ios`        | Start + open iOS simulator |
| `android`    | Start + open Android emulator |
| `typecheck`  | `tsc --noEmit` (strict) |
| `lint`       | ESLint across `src/**` |
| `build:android` / `build:ios` | EAS Build (production) |
| `submit:android` / `submit:ios` | EAS Submit |

## 9. Known hard constraints

These are enforced throughout the codebase:

- No class components — hooks and functional components only.
- No third-party animation libraries — React Native Animated API only.
- No `any` type anywhere — `tsconfig.json` uses `"strict": true` + `"noImplicitAny": true`.
- Offline play is fully functional without network access.
- Supabase is only consulted when signed in AND `isSupabaseConfigured === true`.
- All Supabase tables have Row Level Security enabled (`supabase/migrations/001_initial.sql`).

## 10. License & credits

Original work, © 2026. Word list drafted by Claude; please do a native-speaker pass before a public release.
