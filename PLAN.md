# Uzbek Wordle — план разработки и handoff

Этот файл — детальный план с чекбоксами. Читать вместе с **CLAUDE.md** (общий контекст).

> **Правило:** после каждого выполненного шага — закрыть чекбоксы здесь И обновить раздел "Текущий статус" в `CLAUDE.md`. Коммитить оба файла вместе с кодом.

---

## 0. Контекст и цель

- **Что строим:** клон Wordle на узбекском языке (латиница) для iOS и Android.
- **Стек:** React Native + Expo SDK 51 (managed workflow), TypeScript strict, expo-router, Supabase, AdMob, expo-in-app-purchases.
- **Монетизация:** AdMob (баннер + интерстишл + rewarded) + одноразовая покупка "Remove Ads" ($1.99, product id `uz_wordle_remove_ads`).
- **Фичи:** ежедневное слово (одно на всех, UTC), глобальный лидерборд, 12 достижений, профиль, авторизация Apple + Google, оффлайн-игра.
- **Жёсткие ограничения:** только функциональные компоненты и хуки, только React Native Animated API (без reanimated для анимаций тайлов), `strict: true` + запрет `any`, один кодбейс.

---

## 1. Текущее состояние репозитория

Рабочий каталог: `games/wordle/`. Всё уже создано:

```
games/wordle/
├── PLAN.md                    ← этот файл
├── README.md                  полная инструкция по сборке/релизу
├── package.json               expo 51, все зависимости
├── tsconfig.json              strict mode
├── app.json                   бандлы, AdMob App IDs (placeholder), expo-router с root=src/app
├── eas.json                   профили dev/preview/production
├── babel.config.js            expo + reanimated plugin
├── index.js                   import 'expo-router/entry'
├── expo-env.d.ts              типы EXPO_PUBLIC_* env
├── .env.example
├── .gitignore
├── supabase/migrations/001_initial.sql     users / daily_results / achievements / leaderboard_summary + RLS
└── src/
    ├── app/
    │   ├── _layout.tsx         SafeAreaProvider + AppProvider + Stack
    │   ├── _providers.tsx      объединяет useSettings/useAuth/useAds/usePurchase/useAchievements в один context
    │   ├── index.tsx           game screen (Board + Keyboard + Ads + end-modal)
    │   ├── leaderboard.tsx     FlatList, пагинация 20×5, pull-to-refresh, «My Rank»
    │   ├── profile.tsx         аватар, stats, guess distribution, achievements grid, edit name, sign out
    │   └── settings.tsx        dark / colorblind / hard mode / language / remove ads / restore
    ├── components/
    │   ├── Board.tsx
    │   ├── Row.tsx             с shake-анимацией
    │   ├── Tile.tsx             flip (rotateX) + bounce на победу
    │   ├── Keyboard.tsx         узбекская раскладка + ряд диграфов
    │   ├── Modal.tsx            backdrop + spring-анимация
    │   ├── AchievementToast.tsx slide in from top
    │   ├── AdBanner.tsx         react-native-google-mobile-ads BannerAd
    │   └── Toast.tsx            короткие статусные сообщения
    ├── constants/
    │   ├── colors.ts           light / dark / colorblind палитры
    │   └── keyboard.ts         layout + ALL_LETTER_TOKENS
    ├── data/
    │   ├── words.ts            ANSWER_WORDS + VALID_GUESSES (НУЖЕН ПЕРЕСМОТР — см. §3.1)
    │   └── achievements.ts     12 достижений с check-предикатами
    ├── hooks/
    │   ├── useGame.ts          reducer, persist в AsyncStorage, stats, callback onFinish
    │   ├── useAuth.ts          Apple + Google через supabase.auth.signInWithIdToken
    │   ├── useAchievements.ts  локальный + remote merge, toast-очередь
    │   ├── useAds.ts           mobileAds().initialize() + Interstitial/Rewarded preload
    │   ├── usePurchase.ts      connect → getProducts → purchase/restore + ack
    │   └── useSettings.ts      dark/colorblind/hardMode/language из AsyncStorage
    └── utils/
        ├── gameLogic.ts        tokenizeUzbek + evaluateGuess + getDailyWord + hardMode check
        ├── storage.ts          типизированные AsyncStorage-обёртки
        ├── supabase.ts         клиент + типы Database + query helpers
        └── i18n.ts             три локали (uz/ru/en), без зависимостей
```

---

## 2. Что ещё **не** сделано

1. **`npm install` и фактическая компиляция** — ни одна команда не запускалась. Типы и зависимости проверены только глазами.
2. **Пересмотр списка слов** (`src/data/words.ts`). Я набросал список быстро, там почти наверняка есть:
   - слова, которых в узбекском нет (я генерировал по памяти без словаря);
   - дубликаты;
   - опечатки;
   - записи, попавшие в `VALID_GUESSES` вместо `ANSWER_WORDS` и наоборот.
   Нужен проход носителем языка.
3. **Assets** (`assets/icon.png`, `assets/splash.png`, `assets/adaptive-icon.png`, `assets/favicon.png`) — ни одного не создано, `app.json` на них ссылается. Без них `expo prebuild` / EAS Build упадут.
4. **ESLint конфиг** — в `package.json` есть скрипт `lint` и зависимость `eslint-config-expo`, но `.eslintrc.js` нет.
5. **Unit-тесты** — не написаны. Минимум для надёжности: тесты на `evaluateGuess`, `tokenizeUzbek`, `getDailyWord`, `satisfiesHardMode`.
6. **Rewarded-ad flow** — `useGame.revealRandomLetter()` есть, `useAds.showRewarded()` есть, но UI-кнопка «Harfni ochish» на экране игры не выведена.
7. **Deep links / универсальные ссылки** — `app.json` использует scheme `uzbekwordle`, OAuth redirect URL не настроен.
8. **Store assets** — скриншоты, privacy policy URL, описания в UZ/RU/EN для App Store Connect и Google Play Console.

---

## 3. Пошаговый план (для продолжения на Sonnet)

> **Текущий статус (18 апреля 2026):** весь исходный код написан, ни одна команда не запускалась, ни один внешний сервис не подключён. **Начинать с Шага 1.**

---

### [x] Шаг 1. Проверить компиляцию ✓

- [x] Запустить `npm install` ✓
- [x] Запустить `npx tsc --noEmit` и добиться 0 ошибок ✓
- [ ] Проверить `react-native-google-mobile-ads` v14.x — события должны называться `AdEventType.LOADED` / `RewardedAdEventType.LOADED` (сверить с `src/hooks/useAds.ts`)
- [ ] Проверить `expo-in-app-purchases` — если не ставится на SDK 51, заменить на `expo-iap` или `react-native-iap` и обновить `src/hooks/usePurchase.ts`
- [ ] Проверить `expo-auth-session/providers/google` — параметры `iosClientId`/`androidClientId`/`webClientId` актуальны, иначе перейти на `ExpoGoogleAuthRequest`
- [ ] Если `expo` ругается на `tsconfig.json extends expo/tsconfig.base` — заменить на локальные `compilerOptions`
- [x] Удалить рудимент `void toastId;` в `src/hooks/useGame.ts` ✓
- [x] В `src/data/words.ts` добавить `.filter((w) => w.length === 5)` для `ANSWER_WORDS` ✓
- [x] Удалить неиспользуемые импорты `Platform` (useAds.ts) и `AuthSession` (useAuth.ts) ✓

---

### [ ] Шаг 2. Пересмотреть список слов

Файл: `src/data/words.ts`

- [ ] Прогнать sanity-check скриптом (уникальность, длина, отсутствие пересечений):
  ```ts
  assertWordsValid();
  console.log(new Set(ANSWER_WORDS).size === ANSWER_WORDS.length);
  ```
- [ ] Довести `ANSWER_WORDS` до ~200 слов, проверенных носителем узбекского
- [ ] Довести `VALID_GUESSES` до ~300 слов
- [ ] Убедиться: все слова — ровно 5 ASCII-букв, нижний регистр, без апострофов и диграфов

---

### [x] Шаг 3. Добавить assets ✓

- [x] Создать `assets/icon.png` — 1024×1024 PNG ✓
- [x] Создать `assets/splash.png` — 1284×2778 PNG ✓
- [x] Создать `assets/adaptive-icon.png` — 1024×1024 PNG ✓
- [x] Создать `assets/favicon.png` — 48×48 PNG ✓
- [ ] Убедиться, что `expo prebuild` не падает (проверить на шаге 10)

---

### [ ] Шаг 4. Настроить ESLint

- [ ] Создать файл `games/wordle/.eslintrc.js` с правилами `no-explicit-any`, `no-unused-vars`, `react-hooks/exhaustive-deps`
- [ ] Запустить `npm run lint`
- [ ] Исправить все ошибки до 0

---

### [ ] Шаг 5. Добавить минимальные тесты

- [ ] Установить `jest`, `jest-expo`, `@types/jest`
- [ ] Добавить `"test": "jest"` и preset `jest-expo` в `package.json`
- [ ] Создать `src/__tests__/gameLogic.test.ts`:
  - [ ] `tokenizeUzbek('shahar')` → `['sh','a','h','a','r']`
  - [ ] `tokenizeUzbek("o'tin")` → `["o'",'t','i','n']`
  - [ ] `evaluateGuess` — все `correct` при совпадении
  - [ ] `evaluateGuess` — корректно обрабатывает дублирующиеся буквы
  - [ ] `getDailyIndex(new Date('2025-01-01T00:00:00Z'))` === 0
  - [ ] `getDailyIndex(new Date('2025-01-08T00:00:00Z'))` === 7 % ANSWER_WORDS.length
  - [ ] `satisfiesHardMode` — блокирует игнор зелёного
- [ ] Создать `src/__tests__/words.test.ts`:
  - [ ] `assertWordsValid()` не бросает исключение
  - [ ] Нет пересечений `ANSWER_WORDS ∩ VALID_GUESSES`
  - [ ] Нет дубликатов внутри каждого массива
- [ ] Запустить `npm test` — все зелёные

---

### [ ] Шаг 6. Rewarded-ad UI «Harfni ochish»

- [ ] В `src/app/index.tsx` добавить кнопку «Harfni ochish» (условие: `!isAdFree && submittedGuesses.length >= 3 && status === 'playing'`)
- [ ] Подключить обработчик: `showRewarded()` → `revealRandomLetter()` → показать hint в `Toast`
- [ ] Проверить визуально: кнопка появляется и скрывается в нужный момент

---

### [ ] Шаг 7. Настроить Supabase

- [ ] Создать проект на supabase.com
- [ ] Выполнить `supabase/migrations/001_initial.sql` в SQL Editor
- [ ] Authentication → Providers → включить Apple и Google
- [ ] Скопировать URL + anon key в `.env`
- [ ] Проверить в dev-билде: после игры появляется строка в `public.users` и `public.daily_results`

---

### [ ] Шаг 8. AdMob

- [ ] Зарегистрировать iOS-приложение в admob.google.com, получить App ID
- [ ] Зарегистрировать Android-приложение в admob.google.com, получить App ID
- [ ] Создать 3 Ad Unit для iOS: Banner / Interstitial / Rewarded
- [ ] Создать 3 Ad Unit для Android: Banner / Interstitial / Rewarded
- [ ] Вставить 6 unit-ID в `.env` (`EXPO_PUBLIC_ADMOB_*`)
- [ ] Заменить placeholder App IDs в `app.json` на настоящие
- [ ] Проверить тестовые объявления в dev-билде

---

### [ ] Шаг 9. IAP

- [ ] **iOS:** в App Store Connect создать non-consumable `uz_wordle_remove_ads`, цена tier 2, привязать к приложению
- [ ] **Android:** в Google Play Console (Monetize → In-app products) создать тот же product ID
- [ ] Загрузить подписанный билд на Android Internal Testing (иначе продукт не активируется)
- [ ] Протестировать покупку на iOS Sandbox tester
- [ ] Протестировать покупку на Android License Testing аккаунте
- [ ] Проверить restore purchases

---

### [ ] Шаг 10. EAS Build и внутреннее тестирование

- [ ] Запустить `npx eas build:configure`
- [ ] Собрать dev-билд iOS: `npx eas build --profile development --platform ios`
- [ ] Собрать dev-билд Android: `npx eas build --profile development --platform android`
- [ ] Установить dev client на физическое устройство (не Expo Go)
- [ ] Проверить руками:
  - [ ] Тайлы переворачиваются, bounce-анимация на победу работает
  - [ ] Shake при невалидном слове
  - [ ] Игра восстанавливается после перезапуска приложения
  - [ ] После полуночи UTC — новое слово
  - [ ] Achievement toast появляется и исчезает
  - [ ] Баннер виден, исчезает после покупки, возвращается после сброса storage
  - [ ] Interstitial показывается каждые 3 игры
  - [ ] Лидерборд подгружает страницы, «My Rank» корректен
  - [ ] Dark / colorblind / hard mode переключаются и сохраняются
  - [ ] Смена языка мгновенно перерисовывает UI

---

### [ ] Шаг 11. Store assets и submission

- [ ] Написать и опубликовать Privacy Policy (GitHub Pages / Notion)
- [ ] Вставить URL политики в App Store Connect и Google Play Console
- [ ] Подготовить описание приложения на узбекском, русском, английском
- [ ] Сделать 6 скриншотов iPhone 6.7"
- [ ] Сделать 6 скриншотов Android phone
- [ ] App Store: category = Games → Word, age rating 4+
- [ ] Google Play: content rating = Everyone
- [ ] Настроить TestFlight / Internal testing track
- [ ] Собрать production-билды: `npx eas build --profile production --platform all`
- [ ] `npx eas submit --platform ios` → загрузить в App Store Connect
- [ ] `npx eas submit --platform android` → загрузить в Play Console

---

## 4. Частые грабли

- **expo-router + src/app:** в `app.json` плагин настроен как `["expo-router", { "root": "./src/app" }]`. В каких-то версиях expo-router поле называется иначе — если маршруты не находятся, проверить доку версии и, как fallback, перенести `src/app/` в `./app/`.
- **RN 0.74 + Google Mobile Ads:** если iOS билд падает на `pod install`, установить `cocoapods` ≥ 1.14 и в `ios/Podfile.properties.json` (появится после prebuild) выставить `"expo.jsEngine": "hermes"`.
- **Apple Sign-In на Android:** `expo-apple-authentication` доступен только на iOS — код уже делает guard через `Platform.OS === 'ios'`.
- **Supabase anon key и `EXPO_PUBLIC_*`:** эти переменные ВСТРАИВАЮТСЯ в JS-бандл. Anon key предназначен быть публичным. Не класть туда service_role key.
- **RLS policies:** миграция включает `policy … select … to authenticated using (true)` на `public.users` — это осознанно, иначе лидерборд не сможет показать чужие имена/аватары. Если для продукта нужна анонимность — переделать view на возврат только `user_id` + нейтрального имени.
- **Tile flip и iOS:** `backfaceVisibility: 'hidden'` на iOS иногда глючит в RN 0.74. Если при повороте виден артефакт — заменить на двойной слой с opacity-интерполяцией вокруг 0.5.

---

## 5. Что спросить у пользователя перед релизом

1. Настоящие AdMob App ID и Ad Unit ID (6 значений).
2. OAuth client ID для Google (iOS / Android / Web).
3. Бандл ID для iOS и Android (сейчас `com.route4me.uzbekwordle` — подтвердить или сменить).
4. Supabase URL + anon key.
5. EAS project ID (заменить `extra.eas.projectId` в `app.json`).
6. URL политики конфиденциальности.
7. Носитель узбекского для валидации `words.ts`.

---

## 6. Быстрый чек-лист «готово к submission»

> Статус обновлён 18 апреля 2026. Отмечать по мере выполнения.

- [ ] `npm run typecheck` — 0 ошибок ← **Шаг 1**
- [ ] `npm run lint` — 0 ошибок ← **Шаг 4**
- [ ] `npm test` — все зелёные ← **Шаг 5**
- [ ] `ANSWER_WORDS.length >= 200`, все проверены носителем ← **Шаг 2**
- [ ] Все assets на месте (`icon`, `splash`, `adaptive-icon`, `favicon`) ← **Шаг 3**
- [ ] `.env` заполнен реальными значениями, `app.json` — реальными App IDs ← **Шаги 7–8**
- [ ] Supabase миграция применена, RLS on ← **Шаг 7**
- [ ] IAP product создан в обоих сторах ← **Шаг 9**
- [ ] Сборки `--profile production` успешны ← **Шаг 10**
- [ ] Проверено вручную на одном iOS и одном Android устройстве ← **Шаг 10**
- [ ] Privacy policy доступна по URL ← **Шаг 11**
- [ ] Скриншоты + описание загружены в обе консоли ← **Шаг 11**

---

*Handoff подготовлен для продолжения работы в Claude Sonnet. Всё, что здесь написано, — про состояние на момент создания файла. При расхождении между этим планом и кодом — доверять коду.*
