import { effLongWordlist } from './eff-long-wordlist';

// Char sets
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>/?';
const AMBIGUOUS = /[0O1lI|`'".,;:{}\[\]()\\\/]/g;

// Consonants and vowels for pronounceable mode (avoid visually ambiguous letters).
const CONSONANTS = 'bcdfghjkmnpqrstvwxz';
const VOWELS = 'aeiouy';

export type PasswordMode = 'random' | 'passphrase' | 'pronounceable' | 'format';
export type OutputFormat = 'plain' | 'hex' | 'base64' | 'base64url' | 'uuid';

export interface PasswordOptions {
  mode: PasswordMode
  length: number
  withUppercase: boolean
  withLowercase: boolean
  withNumbers: boolean
  withSymbols: boolean
  excludeAmbiguous: boolean
  requireOneOfEach: boolean
  format: OutputFormat
  // passphrase
  wordCount: number
  wordSeparator: string
  capitalizeWords: boolean
  appendNumber: boolean
  // Optional explicit alphabet, used by OTP to generate base32 secrets.
  alphabet?: string
}

export const defaultOptions: PasswordOptions = {
  mode: 'random',
  length: 20,
  withUppercase: true,
  withLowercase: true,
  withNumbers: true,
  withSymbols: true,
  excludeAmbiguous: true,
  requireOneOfEach: true,
  format: 'plain',
  wordCount: 6,
  wordSeparator: '-',
  capitalizeWords: true,
  appendNumber: false,
};

// Cryptographically secure random int in [0, max).
function secureRandomInt(max: number): number {
  if (max <= 0) {
    return 0;
  }
  // Rejection sampling to avoid modulo bias.
  const range = 2 ** 32;
  const limit = range - (range % max);
  const buf = new Uint32Array(1);
  while (true) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) {
      return buf[0] % max;
    }
  }
}

function randomChar(alphabet: string): string {
  return alphabet[secureRandomInt(alphabet.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildAlphabet(opts: Pick<PasswordOptions, 'withUppercase' | 'withLowercase' | 'withNumbers' | 'withSymbols' | 'excludeAmbiguous'>): { alphabet: string; pools: string[] } {
  const pools = [
    opts.withUppercase ? UPPERCASE : '',
    opts.withLowercase ? LOWERCASE : '',
    opts.withNumbers ? NUMBERS : '',
    opts.withSymbols ? SYMBOLS : '',
  ].map(p => opts.excludeAmbiguous ? p.replace(AMBIGUOUS, '') : p).filter(p => p.length > 0);

  return {
    alphabet: pools.join(''),
    pools,
  };
}

function generateRandom(opts: PasswordOptions): string {
  const { alphabet, pools } = buildAlphabet(opts);

  if (alphabet.length === 0 || opts.length <= 0) {
    return '';
  }

  if (opts.requireOneOfEach && pools.length <= opts.length) {
    // Seed with one char from each selected pool, fill the rest, shuffle.
    const seed = pools.map(pool => randomChar(pool));
    const remaining = Array.from({ length: opts.length - seed.length }, () => randomChar(alphabet));
    return shuffle([...seed, ...remaining]).join('');
  }

  return Array.from({ length: opts.length }, () => randomChar(alphabet)).join('');
}

function generatePassphrase(opts: PasswordOptions): string {
  const count = Math.max(1, opts.wordCount);
  const words = Array.from({ length: count }, () => {
    const w = effLongWordlist[secureRandomInt(effLongWordlist.length)];
    return opts.capitalizeWords ? w.charAt(0).toUpperCase() + w.slice(1) : w;
  });

  if (opts.appendNumber) {
    words.push(String(secureRandomInt(100)).padStart(2, '0'));
  }

  return words.join(opts.wordSeparator);
}

function generatePronounceable(opts: PasswordOptions): string {
  const length = Math.max(2, opts.length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += randomChar(i % 2 === 0 ? CONSONANTS : VOWELS);
  }

  if (opts.appendNumber) {
    // Swap last 2 chars for digits to inject some entropy.
    out = out.slice(0, -2) + String(secureRandomInt(100)).padStart(2, '0');
  }

  return out;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function toBase64(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) {
    s += String.fromCharCode(b);
  }
  return btoa(s);
}

function toBase64Url(bytes: Uint8Array): string {
  return toBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateUuidV4(): string {
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0F) | 0x40;
  b[8] = (b[8] & 0x3F) | 0x80;
  const h = toHex(b);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function generateFormat(opts: PasswordOptions): string {
  if (opts.format === 'uuid') {
    return generateUuidV4();
  }
  // length is in chars for hex, bytes otherwise.
  const byteLen = opts.format === 'hex'
    ? Math.max(1, Math.ceil(opts.length / 2))
    : Math.max(1, opts.length);
  const bytes = new Uint8Array(byteLen);
  crypto.getRandomValues(bytes);

  switch (opts.format) {
    case 'hex':
      return toHex(bytes).slice(0, opts.length);
    case 'base64':
      return toBase64(bytes).slice(0, opts.length);
    case 'base64url':
      return toBase64Url(bytes).slice(0, opts.length);
    default:
      return toHex(bytes);
  }
}

export function generatePassword(opts: PasswordOptions): string {
  switch (opts.mode) {
    case 'passphrase':
      return generatePassphrase(opts);
    case 'pronounceable':
      return generatePronounceable(opts);
    case 'format':
      return generateFormat(opts);
    case 'random':
    default:
      return generateRandom(opts);
  }
}

export function getEntropyBits(password: string, opts: PasswordOptions): number {
  if (!password) {
    return 0;
  }

  if (opts.mode === 'passphrase') {
    return Math.log2(effLongWordlist.length) * opts.wordCount
      + (opts.appendNumber ? Math.log2(100) : 0);
  }

  if (opts.mode === 'format') {
    switch (opts.format) {
      case 'hex':
        return 4 * password.length;
      case 'base64':
      case 'base64url':
        return 6 * password.length;
      case 'uuid':
        return 122; // 128 bits minus 6 fixed.
      default:
        return 0;
    }
  }

  if (opts.mode === 'pronounceable') {
    // Rough estimate: alternating consonant/vowel pattern.
    const half = Math.floor(password.length / 2);
    return half * Math.log2(CONSONANTS.length) + (password.length - half) * Math.log2(VOWELS.length)
      + (opts.appendNumber ? Math.log2(100) - Math.log2(CONSONANTS.length) - Math.log2(VOWELS.length) : 0);
  }

  // random: inspect the password to detect the real charset.
  const { alphabet } = buildAlphabet(opts);
  return Math.log2(Math.max(2, alphabet.length)) * password.length;
}

export function estimateCrackTime(entropyBits: number, guessesPerSecond = 1e11): string {
  if (entropyBits <= 0) {
    return 'Instantly';
  }

  const seconds = 2 ** entropyBits / guessesPerSecond;

  if (seconds < 1) {
    return 'Less than a second';
  }

  const units: Array<[string, number]> = [
    ['millennium', 31536000000],
    ['century', 3153600000],
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];

  for (const [unit, s] of units) {
    if (seconds >= s) {
      const qty = seconds / s;
      if (qty >= 1e6) {
        return `${qty.toExponential(2)} ${unit}s`;
      }
      const rounded = Math.floor(qty);
      return `${rounded.toLocaleString()} ${unit}${rounded === 1 ? '' : 's'}`;
    }
  }

  return 'Less than a second';
}

const NATO: Record<string, string> = {
  A: 'Alpha',
  B: 'Bravo',
  C: 'Charlie',
  D: 'Delta',
  E: 'Echo',
  F: 'Foxtrot',
  G: 'Golf',
  H: 'Hotel',
  I: 'India',
  J: 'Juliet',
  K: 'Kilo',
  L: 'Lima',
  M: 'Mike',
  N: 'November',
  O: 'Oscar',
  P: 'Papa',
  Q: 'Quebec',
  R: 'Romeo',
  S: 'Sierra',
  T: 'Tango',
  U: 'Uniform',
  V: 'Victor',
  W: 'Whiskey',
  X: 'Xray',
  Y: 'Yankee',
  Z: 'Zulu',
  0: 'Zero',
  1: 'One',
  2: 'Two',
  3: 'Three',
  4: 'Four',
  5: 'Five',
  6: 'Six',
  7: 'Seven',
  8: 'Eight',
  9: 'Nine',
};

const SYMBOL_NAMES: Record<string, string> = {
  '!': 'bang',
  '@': 'at',
  '#': 'hash',
  '$': 'dollar',
  '%': 'percent',
  '^': 'caret',
  '&': 'amp',
  '*': 'star',
  '(': 'open-paren',
  ')': 'close-paren',
  '-': 'dash',
  '_': 'underscore',
  '=': 'equals',
  '+': 'plus',
  '[': 'open-bracket',
  ']': 'close-bracket',
  '{': 'open-brace',
  '}': 'close-brace',
  ';': 'semicolon',
  ':': 'colon',
  ',': 'comma',
  '.': 'dot',
  '<': 'less-than',
  '>': 'greater-than',
  '/': 'slash',
  '?': 'question',
  ' ': 'space',
};

export function toPhonetic(text: string): string {
  return text.split('').map((ch) => {
    const upper = ch.toUpperCase();
    if (NATO[upper]) {
      const word = NATO[upper];
      return ch === ch.toLowerCase() && /[a-z]/.test(ch) ? word.toLowerCase() : word;
    }
    return SYMBOL_NAMES[ch] ?? ch;
  }).join(' ');
}

// ---------------------------------------------------------------------------
// Simple arbitrary-alphabet token helper. Used by the OTP generator to build
// base32 secrets.
// ---------------------------------------------------------------------------
export function createToken({
  withUppercase = true,
  withLowercase = true,
  withNumbers = true,
  withSymbols = false,
  length = 64,
  alphabet,
}: {
  withUppercase?: boolean
  withLowercase?: boolean
  withNumbers?: boolean
  withSymbols?: boolean
  length?: number
  alphabet?: string
}): string {
  if (alphabet) {
    if (!alphabet.length || length <= 0) {
      return '';
    }
    return Array.from({ length }, () => randomChar(alphabet)).join('');
  }

  return generateRandom({
    ...defaultOptions,
    mode: 'random',
    length,
    withUppercase,
    withLowercase,
    withNumbers,
    withSymbols,
    excludeAmbiguous: false,
    requireOneOfEach: false,
  });
}
