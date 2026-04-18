/**
 * Uzbek 5-letter word lists (Latin script).
 *
 * Every word in these arrays is EXACTLY 5 characters of pure ASCII Latin
 * (a–z, no apostrophes, no digraphs). The daily-word engine and the
 * isValidWord() checker rely on this invariant.
 *
 * Uzbek has digraph letters (sh, ch, ng) and apostrophe letters (oʻ, gʻ).
 * To keep the game logic simple and the tile grid consistent, the shipping
 * word lists contain only pure 5-character ASCII words. Native speakers can
 * extend the lists later by editing this file and keeping the 5-char rule.
 *
 * ANSWER_WORDS  — curated, commonly-known words used as daily answers.
 * VALID_GUESSES — additional words accepted as guesses (never daily answers).
 *
 * All words are lowercase; the UI uppercases for display.
 * A native-speaker review is strongly recommended before App Store/Play submission.
 */

export const ANSWER_WORDS: readonly string[] = ([
  'bozor', 'qalam', 'kitob', 'vatan', 'hayot', 'dunyo', 'osmon', 'zamon',
  'oydin', 'bulut', 'tuman', 'daryo', 'yurak', 'burun', 'bilak', 'yelka',
  'jigar', 'quloq', 'hafta', 'savol', 'javob', 'saboq', 'maqol', 'varaq',
  'ustoz', 'ustun', 'devor', 'karta', 'kurak', 'qatiq', 'somsa', 'sabzi',
  'qovun', 'qovoq', 'bodom', 'anjir', 'banan', 'limon', 'gilos', 'piyoz',
  'tovuq', 'xoroz', 'quyon', 'tulki', 'sigir', 'baliq', 'turna', 'qumri',
  'tuxum', 'tuyoq', 'tovus', 'kavak', 'kulba', 'sumka', 'palma', 'tufli',
  'gilam', 'sovun', 'sirka', 'surma', 'tugma', 'katta', 'qisqa', 'qalin',
  'yupqa', 'issiq', 'sovuq', 'quruq', 'iflos', 'tiniq', 'suluv', 'sekin',
  'mayin', 'keksa', 'keyin', 'komil', 'dadil', 'yomon', 'haqli', 'nohaq',
  'pokiz', 'sirli', 'sopli', 'suvli', 'damli', 'suyuq', 'yetuk', 'yirik',
  'oqsoq', 'sariq', 'qizil', 'sevgi', 'havas', 'vahim', 'zahar', 'zarar',
  'zarra', 'zamin', 'rohat', 'rahat', 'rahim', 'hujum', 'janub', 'ziyon',
  'zolim', 'zehni', 'ziddi', 'botir', 'qabul', 'qabih', 'xalqi', 'xotin',
  'xotir', 'xayol', 'xalol', 'xamir', 'xonim', 'xarid', 'xasta', 'xatar',
  'mador', 'idora', 'zavod', 'muzey', 'qayiq', 'qadam', 'qatra', 'qirol',
  'qozon', 'qator', 'qayin', 'qadim', 'qayta', 'qaysi', 'qomat', 'qonun',
  'hakim', 'tabib', 'erkak', 'yigit', 'olima', 'kelin', 'kosib', 'bahor',
  'yozgi', 'kuzgi', 'tongi', 'lahza', 'safar', 'tarix', 'terak', 'tovon',
  'talab', 'meros', 'mezon', 'namak', 'narsa', 'nazar', 'sabab', 'sabir',
  'salim', 'salom', 'sahar', 'sahna', 'sifat', 'arava', 'aroba', 'olmos',
  'odami', 'odati', 'oftob', 'obuna', 'bekor', 'bekat', 'baqir', 'barra',
  'bosim', 'buyuk', 'buzoq', 'dalil', 'dalda', 'dasta', 'daydi', 'dinli',
  'dumba', 'ertak', 'etkaz', 'faner', 'fayda', 'fasod', 'fitna', 'folga',
  'gavda', 'guruh', 'hadya', 'idrok', 'ikrom', 'ilhom', 'imkon', 'irfon',
  'istak', 'jadid', 'jadal', 'jamoa', 'jonli', 'karam', 'kasal', 'kasbi',
] as string[]).filter((w) => w.length === 5);

export const VALID_GUESSES: readonly string[] = [
  'abzal', 'adash', 'aqida', 'aqlli', 'asbob', 'asrab', 'atala', 'atlas',
  'atrof', 'avlod', 'avtor', 'axlat', 'aziza', 'badan', 'bayli', 'belgi',
  'biron', 'birga', 'bolta', 'buyum', 'burch', 'chori', 'choyi', 'chizi',
  'daxma', 'devon', 'dolon', 'domla', 'donor', 'dovur', 'eshon', 'eskir',
  'fahmi', 'fasli', 'firma', 'fonus', 'foyda', 'gapli', 'gardi', 'gazak',
  'gazal', 'gazma', 'gilza', 'goyib', 'hadis', 'hadik', 'hajvi', 'hamon',
  'hamza', 'hanif', 'hayit', 'hidli', 'hiyla', 'hojat', 'homuz', 'hujra',
  'ikkov', 'ildiz', 'ilmiy', 'iqbol', 'irmoq', 'isbot', 'ismim', 'isnad',
  'isyon', 'itlar', 'izofa', 'izzat', 'jalal', 'jamol', 'janda', 'japar',
  'jilga', 'jilva', 'jinoy', 'jiyan', 'jodul', 'jumla', 'junon', 'jurat',
  'juvon', 'kabob', 'kafan', 'kafil', 'kalla', 'kamol', 'kamar', 'kapot',
  'katak', 'kecha', 'kelgi', 'kesik', 'kesma', 'kishi', 'kiyik', 'kiyim',
  'kiyov', 'konus', 'kofir', 'kolba', 'konka', 'kufur', 'kulgi', 'kumir',
  'kunji', 'kuzov', 'lagan', 'lahim', 'laylo', 'loyqa', 'mabda', 'madad',
  'mahal', 'maida', 'malla', 'manor', 'maqom', 'marja', 'marta', 'masal',
  'mayda', 'mayiz', 'mayli', 'mirza', 'mitti', 'mohir', 'muhim', 'mulki',
  'mumin', 'nabot', 'nafas', 'nafsi', 'najot', 'namad', 'navda', 'nayza',
  'nigoh', 'nihol', 'nimta', 'nodir', 'nogoh', 'noyob', 'nozuk', 'nurli',
  'obzor', 'odobi', 'ofati', 'oilas', 'oltin', 'omadi', 'oppoq', 'ormon',
  'ortiq', 'otliq', 'palak', 'paloz', 'panoh', 'parda', 'parvo', 'patir',
  'paydo', 'payti', 'pilta', 'poyga', 'qadoq', 'qafas', 'qalbi', 'qanot',
  'qaroq', 'qator', 'qayli', 'qiyin', 'qizim', 'qolip', 'qorin', 'qovuq',
  'qumri', 'rahat', 'rahim', 'raqam', 'raqib', 'rasmi', 'ravis', 'rayon',
  'rejim', 'robot', 'roziy', 'rubob', 'rukun', 'rutba', 'sadaf', 'sahih',
  'sakin', 'salat', 'sanaq', 'sarpo', 'satin', 'savdo', 'senga', 'serka',
  'shahd', 'shart', 'shayx', 'sifat', 'sinov', 'sipoh', 'siyoh', 'sodda',
  'sodir', 'sovga', 'sunni', 'surat', 'suyak', 'taboy', 'tajan', 'talon',
  'taqvo', 'tarzi', 'taxta', 'tayoq', 'tekin', 'tetik', 'tezda', 'tilim',
  'tilla', 'tinim', 'tobut', 'tojik', 'tomoq', 'tugun', 'tumar', 'tumov',
  'uchun', 'umrim', 'urmoq', 'ushbu', 'uxlab', 'uyali', 'uylan', 'vafat',
  'vaqti', 'vazir', 'vazni', 'viran', 'voris', 'xabar', 'xamsa', 'xulqi',
  'yakun', 'yalov', 'yaqin', 'yarim', 'yetim', 'yonib', 'yuris', 'yutuq',
  'zabon', 'zakon', 'bahri', 'biroq', 'bugun', 'chiki', 'chora', 'cholg',
  'danak', 'ekran', 'evara', 'farzand', 'fursat', 'fayzi', 'gildi', 'goyat',
  'hamda', 'harir', 'havas', 'hayol', 'hozir', 'ichak', 'iloji', 'inson',
  'jaran', 'jamal', 'jarla', 'jazza', 'kabin', 'kamon', 'kanda', 'karam',
  'katta', 'kitoa', 'komuz', 'kumos', 'kuydi', 'lolqo', 'manzi', 'marom',
  'mazax', 'mezon', 'milni', 'minor', 'mitri', 'mohit', 'mosiy', 'motam',
  'munis', 'muzaf', 'nabot', 'namsi', 'narni', 'nashr', 'navli', 'nekos',
  'nisha', 'nomzd', 'norma', 'oshna', 'oyoqa', 'oxori', 'paxsa', 'puchu',
  'qaroz', 'qashq', 'qiron', 'qozim', 'qurbo', 'qushd', 'rakat', 'ramzi',
  'rangi', 'rezgi', 'rusla', 'sabok', 'sahmi', 'salla', 'satil', 'satra',
  'savti', 'sayin', 'shaki', 'shiyb', 'shoxi', 'shurg', 'sintaq', 'sobir',
  'soyag', 'sozni', 'subhi', 'sulfa', 'sumak', 'suron', 'tabal', 'tabar',
  'tagli', 'tanaf', 'tanba', 'tansi', 'tarog', 'tengi', 'tipli', 'titar',
  'tojli', 'topga', 'toqim', 'toshb', 'tovli', 'tubli', 'turim', 'tushi',
  'uchma', 'ulcha', 'ummat', 'unvon', 'uqubat', 'urfon', 'usuli', 'uvoqi',
  'vafot', 'vakil', 'vazif', 'vidos', 'vijdo', 'voqea', 'xalti', 'xayf',
  'xoloi', 'yakni', 'yopin', 'yoqar', 'yolgi', 'yutuk', 'zabti', 'zarif',
  'ziyof', 'zotan', 'zurga',
].filter((w) => w.length === 5);

// Runtime assertion helpers used by tests or dev tools:
export function assertWordsValid(): void {
  for (const w of ANSWER_WORDS) {
    if (w.length !== 5 || !/^[a-z]{5}$/.test(w)) {
      throw new Error(`Invalid ANSWER_WORDS entry: "${w}"`);
    }
  }
  for (const w of VALID_GUESSES) {
    if (w.length !== 5 || !/^[a-z]{5}$/.test(w)) {
      throw new Error(`Invalid VALID_GUESSES entry: "${w}"`);
    }
  }
}
