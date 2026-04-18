# CLAUDE.md — Uzbek Wordle

Этот файл читается автоматически при каждой новой сессии.
Здесь — всё, что нужно знать чтобы сразу продолжить работу.

---

## Проект

**Что:** Клон Wordle на узбекском языке (Latin script) для iOS и Android.
**Репо:** https://github.com/Akunin94/game-wordle
**Рабочий каталог:** `games/wordle/` внутри папки `Mobile Games`

---

## Стек

- React Native 0.74 + Expo SDK 51 (managed workflow)
- TypeScript strict (`strict: true`, `noImplicitAny`, `noUnusedLocals`)
- expo-router 3.5 (файловая маршрутизация, root = `src/app/`)
- Supabase JS v2 (auth + leaderboard + achievements)
- react-native-google-mobile-ads v14 (Banner, Interstitial, Rewarded)
- expo-in-app-purchases v14 (non-consumable "Remove Ads" $1.99)
- AsyncStorage для локального состояния

---

## Важные решения и почему

| Решение | Причина |
|---------|---------|
| `createClient(...)` без `<Database>` generic | Supabase JS 2.60+ изменил `GenericSchema` constraints — typed client ломается. Типобезопасность через explicit return types в хелперах (`src/utils/supabase.ts`) |
| Только `React Native Animated API` (не reanimated) | Жёсткое ограничение проекта |
| `void toastId` удалён из `useGame.ts` | Был рудимент без реальной логики |
| `.filter((w) => w.length === 5)` на `ANSWER_WORDS` | Приведение к единообразию с `VALID_GUESSES` |
| `Platform` и `AuthSession` импорты удалены | Были импортированы но не использовались |

---

## Структура проекта

```
games/wordle/
├── CLAUDE.md              ← этот файл
├── PLAN.md                ← план с чекбоксами (всегда обновлять!)
├── README.md
├── package.json
├── tsconfig.json
├── app.json               ← AdMob App IDs (сейчас плейсхолдеры)
├── eas.json
├── babel.config.js
├── index.js
├── expo-env.d.ts          ← типы для EXPO_PUBLIC_* переменных
├── .env.example
├── supabase/
│   └── migrations/001_initial.sql
└── src/
    ├── app/               ← экраны (expo-router)
    │   ├── _layout.tsx
    │   ├── _providers.tsx ← единый AppContext (auth/ads/purchase/achievements/settings)
    │   ├── index.tsx      ← игровой экран
    │   ├── leaderboard.tsx
    │   ├── profile.tsx
    │   └── settings.tsx
    ├── components/        ← Board, Row, Tile, Keyboard, Modal, Toast, AdBanner, AchievementToast
    ├── constants/         ← colors.ts (light/dark/colorblind), keyboard.ts
    ├── data/              ← words.ts, achievements.ts
    ├── hooks/             ← useGame, useAuth, useAds, usePurchase, useSettings, useAchievements
    └── utils/             ← gameLogic.ts, storage.ts, supabase.ts, i18n.ts
```

---

## Переменные окружения

Все в `.env` (копировать из `.env.example`). Все обязательны для production:

```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_ADMOB_ANDROID_APP_ID
EXPO_PUBLIC_ADMOB_IOS_APP_ID
EXPO_PUBLIC_ADMOB_BANNER_ID
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID
EXPO_PUBLIC_ADMOB_REWARDED_ID
EXPO_PUBLIC_IAP_REMOVE_ADS_ID       (default: uz_wordle_remove_ads)
EXPO_PUBLIC_GOOGLE_AUTH_CLIENT_ID_IOS
EXPO_PUBLIC_GOOGLE_AUTH_CLIENT_ID_ANDROID
EXPO_PUBLIC_GOOGLE_AUTH_CLIENT_ID_WEB
```

---

## Текущий статус (обновлять после каждой сессии)

**Последнее обновление:** 18 апреля 2026

| Шаг | Описание | Статус |
|-----|----------|--------|
| 1 | npm install + tsc --noEmit = 0 ошибок | ✅ готово |
| 2 | Пересмотр списка слов (носитель) | ⬜ не начат |
| 3 | Assets (icon, splash, favicon) | ✅ готово |
| 4 | ESLint конфиг | ⬜ не начат |
| 5 | Юнит-тесты | ⬜ не начат |
| 6 | Rewarded-ad UI | ⬜ не начат |
| 7 | Supabase (реальный проект) | ⬜ не начат |
| 8 | AdMob (реальные ID) | ⬜ не начат |
| 9 | IAP в сторах | ⬜ не начат |
| 10 | EAS Build + ручное тестирование | ⬜ не начат |
| 11 | Store assets + submission | ⬜ не начат |

Детальные чекбоксы по каждому шагу — в **PLAN.md**.

---

## Правило синхронизации (ВАЖНО)

После **каждого изменения** в коде или прогресса по плану — обновить:

1. **`PLAN.md`** — закрыть выполненные чекбоксы `[ ]` → `[x]`
2. **`CLAUDE.md`** → раздел "Текущий статус" + раздел "Важные решения" если было принято новое решение
3. **Закоммитить оба файла** вместе с изменениями кода

Это гарантирует, что любая следующая сессия Claude сразу понимает состояние проекта.

---

## Команды

```bash
cd "Mobile Games/games/wordle"
npm run typecheck      # tsc --noEmit
npm run lint           # eslint (после шага 4)
npm test               # jest (после шага 5)
npm run start          # expo start (dev сервер)
npx eas build --profile development --platform ios
npx eas build --profile development --platform android
```

---

## Известные грабли

- `expo-in-app-purchases` устарел на SDK 51 — при проблемах заменить на `expo-iap`
- AdMob App ID в `app.json` — сейчас плейсхолдеры `ca-app-pub-0000…`. Заменить до первой нативной сборки, иначе SDK упадёт при старте
- Apple Sign-In работает только на iOS (`Platform.OS === 'ios'` guard уже стоит)
- Supabase anon key попадает в JS bundle — это нормально, не класть service_role key
- EAS Build не работает с Expo Go — нужен dev client на физическом устройстве
