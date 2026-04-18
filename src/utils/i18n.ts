/**
 * Tiny hand-rolled i18n. Three locales: Uzbek (primary), Russian, English.
 * Kept intentionally free of dependencies so the bundle stays small.
 */

export type Locale = 'uz' | 'ru' | 'en';

type StringKey =
  | 'appName'
  | 'tabGame'
  | 'tabLeaderboard'
  | 'tabProfile'
  | 'tabSettings'
  | 'todaysWord'
  | 'notEnoughLetters'
  | 'notInWordList'
  | 'alreadyGuessed'
  | 'win'
  | 'lose'
  | 'tryAgainTomorrow'
  | 'youWon'
  | 'theWordWas'
  | 'signIn'
  | 'signInApple'
  | 'signInGoogle'
  | 'signOut'
  | 'playOffline'
  | 'stats'
  | 'gamesPlayed'
  | 'winPct'
  | 'currentStreak'
  | 'maxStreak'
  | 'guessDistribution'
  | 'achievements'
  | 'locked'
  | 'removeAds'
  | 'restorePurchases'
  | 'darkMode'
  | 'colorblind'
  | 'hardMode'
  | 'language'
  | 'howToPlay'
  | 'editName'
  | 'save'
  | 'cancel'
  | 'leaderboard'
  | 'myRank'
  | 'noData'
  | 'loading'
  | 'signInToSeeLeaderboard'
  | 'signInToSaveProgress'
  | 'hardModeLocked'
  | 'adFreePurchased'
  | 'adFreeRestored'
  | 'purchaseFailed'
  | 'revealLetter'
  | 'watchAdToReveal';

export const TRANSLATIONS: Record<Locale, Record<StringKey, string>> = {
  uz: {
    appName: 'Oʻzbek Wordle',
    tabGame: 'Oʻyin',
    tabLeaderboard: 'Reyting',
    tabProfile: 'Profil',
    tabSettings: 'Sozlamalar',
    todaysWord: 'Bugungi soʻz',
    notEnoughLetters: 'Harflar yetmaydi',
    notInWordList: 'Soʻz lugʻatda yoʻq',
    alreadyGuessed: 'Allaqachon urinib koʻrdingiz',
    win: 'Gʻalaba!',
    lose: 'Maglubiyat',
    tryAgainTomorrow: 'Ertaga yana urinib koʻring',
    youWon: 'Tabriklaymiz!',
    theWordWas: 'Soʻz edi:',
    signIn: 'Kirish',
    signInApple: 'Apple orqali kirish',
    signInGoogle: 'Google orqali kirish',
    signOut: 'Chiqish',
    playOffline: 'Oflayn oʻynash',
    stats: 'Statistika',
    gamesPlayed: 'Oʻyinlar',
    winPct: 'Gʻalaba %',
    currentStreak: 'Joriy ketma-ketlik',
    maxStreak: 'Eng koʻp ketma-ketlik',
    guessDistribution: 'Taxmin taqsimoti',
    achievements: 'Yutuqlar',
    locked: 'Yopiq',
    removeAds: 'Reklamani olib tashlash',
    restorePurchases: 'Xaridlarni tiklash',
    darkMode: 'Tungi rejim',
    colorblind: 'Rangni ajratuvchi rejim',
    hardMode: 'Qiyin rejim',
    language: 'Til',
    howToPlay: 'Qanday oʻynash',
    editName: 'Ismni oʻzgartirish',
    save: 'Saqlash',
    cancel: 'Bekor qilish',
    leaderboard: 'Global reyting',
    myRank: 'Mening oʻrnim',
    noData: 'Maʼlumot yoʻq',
    loading: 'Yuklanmoqda...',
    signInToSeeLeaderboard: 'Reytingni koʻrish uchun tizimga kiring',
    signInToSaveProgress: 'Natijalarni saqlash uchun tizimga kiring',
    hardModeLocked: 'Qiyin rejim oʻyin boshlanganidan keyin yoqilmaydi',
    adFreePurchased: 'Reklamasiz rejim faollashtirildi',
    adFreeRestored: 'Xarid tiklandi',
    purchaseFailed: 'Xaridni amalga oshirib boʻlmadi',
    revealLetter: 'Harfni ochish',
    watchAdToReveal: 'Harfni ochish uchun reklama koʻring',
  },
  ru: {
    appName: 'Узбекский Wordle',
    tabGame: 'Игра',
    tabLeaderboard: 'Рейтинг',
    tabProfile: 'Профиль',
    tabSettings: 'Настройки',
    todaysWord: 'Слово дня',
    notEnoughLetters: 'Недостаточно букв',
    notInWordList: 'Нет в словаре',
    alreadyGuessed: 'Вы уже пробовали это слово',
    win: 'Победа!',
    lose: 'Поражение',
    tryAgainTomorrow: 'Попробуйте завтра',
    youWon: 'Поздравляем!',
    theWordWas: 'Это слово:',
    signIn: 'Войти',
    signInApple: 'Войти через Apple',
    signInGoogle: 'Войти через Google',
    signOut: 'Выйти',
    playOffline: 'Играть оффлайн',
    stats: 'Статистика',
    gamesPlayed: 'Игр сыграно',
    winPct: 'Побед %',
    currentStreak: 'Текущая серия',
    maxStreak: 'Макс. серия',
    guessDistribution: 'Распределение попыток',
    achievements: 'Достижения',
    locked: 'Закрыто',
    removeAds: 'Убрать рекламу',
    restorePurchases: 'Восстановить покупки',
    darkMode: 'Тёмная тема',
    colorblind: 'Режим дальтоника',
    hardMode: 'Сложный режим',
    language: 'Язык',
    howToPlay: 'Как играть',
    editName: 'Изменить имя',
    save: 'Сохранить',
    cancel: 'Отмена',
    leaderboard: 'Мировой рейтинг',
    myRank: 'Моё место',
    noData: 'Нет данных',
    loading: 'Загрузка...',
    signInToSeeLeaderboard: 'Войдите, чтобы увидеть рейтинг',
    signInToSaveProgress: 'Войдите, чтобы сохранять прогресс',
    hardModeLocked: 'Сложный режим нельзя включать во время игры',
    adFreePurchased: 'Реклама отключена',
    adFreeRestored: 'Покупка восстановлена',
    purchaseFailed: 'Не удалось совершить покупку',
    revealLetter: 'Открыть букву',
    watchAdToReveal: 'Посмотрите рекламу, чтобы открыть букву',
  },
  en: {
    appName: 'Uzbek Wordle',
    tabGame: 'Game',
    tabLeaderboard: 'Leaderboard',
    tabProfile: 'Profile',
    tabSettings: 'Settings',
    todaysWord: "Today's word",
    notEnoughLetters: 'Not enough letters',
    notInWordList: 'Not in word list',
    alreadyGuessed: 'Already guessed',
    win: 'You win!',
    lose: 'Game over',
    tryAgainTomorrow: 'Try again tomorrow',
    youWon: 'Congratulations!',
    theWordWas: 'The word was:',
    signIn: 'Sign in',
    signInApple: 'Sign in with Apple',
    signInGoogle: 'Sign in with Google',
    signOut: 'Sign out',
    playOffline: 'Play offline',
    stats: 'Statistics',
    gamesPlayed: 'Played',
    winPct: 'Win %',
    currentStreak: 'Current streak',
    maxStreak: 'Max streak',
    guessDistribution: 'Guess distribution',
    achievements: 'Achievements',
    locked: 'Locked',
    removeAds: 'Remove Ads',
    restorePurchases: 'Restore Purchases',
    darkMode: 'Dark mode',
    colorblind: 'Colorblind mode',
    hardMode: 'Hard mode',
    language: 'Language',
    howToPlay: 'How to play',
    editName: 'Edit name',
    save: 'Save',
    cancel: 'Cancel',
    leaderboard: 'Global leaderboard',
    myRank: 'My rank',
    noData: 'No data',
    loading: 'Loading…',
    signInToSeeLeaderboard: 'Sign in to see the leaderboard',
    signInToSaveProgress: 'Sign in to save your progress',
    hardModeLocked: 'Hard mode can only be toggled before a game starts',
    adFreePurchased: 'Ad-free unlocked',
    adFreeRestored: 'Purchase restored',
    purchaseFailed: 'Purchase failed',
    revealLetter: 'Reveal a letter',
    watchAdToReveal: 'Watch an ad to reveal a letter',
  },
};

export function t(locale: Locale, key: StringKey): string {
  return TRANSLATIONS[locale][key] ?? TRANSLATIONS.en[key];
}
