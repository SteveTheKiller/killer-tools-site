import { Buffer } from 'node:buffer';
import { createHmac, generateKeyPairSync, randomBytes, randomUUID } from 'node:crypto';
import { readFile, stat, writeFile } from 'node:fs/promises';
import bip39 from '@it-tools/bip39';
import { McpServer } from '@modelcontextprotocol/server';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { compare, hash } from 'bcryptjs';
import cryptoJs from 'crypto-js';
import verifyPdf from 'pdf-signature-reader';
import { z } from 'zod';
import { ALGORITHM_DESCRIPTIONS, CLAIM_DESCRIPTIONS } from '../../src/tools/jwt-parser/jwt-parser.constants.ts';
import { effLongWordlist } from '../../src/tools/password-generator/eff-long-wordlist.ts';
import { getPasswordCrackTimeEstimation } from '../../src/tools/password-strength-analyser/password-strength-analyser.service.ts';
import { registerBrowserCompanion } from './browser-companion.mjs';
import { registerLocalWorkerTools } from './worker-bridge.mjs';

const result = value => ({ content: [{ type: 'text', text: JSON.stringify(value) }] });
const error = message => ({ content: [{ type: 'text', text: message }], isError: true });
const text = z.string().max(8192);
const algorithms = ['MD5', 'RIPEMD160', 'SHA1', 'SHA3', 'SHA224', 'SHA256', 'SHA384', 'SHA512'];
const encodings = ['Bin', 'Hex', 'Base64', 'Base64url'];
const langs = {
  'English': bip39.englishWordList,
  'Czech': bip39.czechWordList,
  'French': bip39.frenchWordList,
  'Italian': bip39.italianWordList,
  'Japanese': bip39.japaneseWordList,
  'Korean': bip39.koreanWordList,
  'Portuguese': bip39.portugueseWordList,
  'Spanish': bip39.spanishWordList,
  'Chinese simplified': bip39.chineseSimplifiedWordList,
  'Chinese traditional': bip39.chineseTraditionalWordList,
};

function encodeWords(words, encoding) {
  const hex = words.toString(cryptoJs.enc.Hex);
  if (encoding === 'Bin') {
    return [...hex].map(digit => Number.parseInt(digit, 16).toString(2).padStart(4, '0')).join('');
  }
  return words.toString(cryptoJs.enc[encoding]);
}

function decodeJwtPart(part) {
  if (!/^[\w-]+$/.test(part) || part.length > 8192) {
    throw new Error('Invalid JWT part');
  }
  return JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
}

function describeClaims(values) {
  return Object.entries(values).map(([claim, value]) => {
    const formattedValue = value !== null && typeof value === 'object' ? JSON.stringify(value, null, 3) : String(value);
    let friendlyValue;
    if (['exp', 'nbf', 'iat'].includes(claim)) {
      const date = new Date(Number(value) * 1000);
      friendlyValue = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }
    else if (claim === 'alg' && typeof value === 'string') {
      friendlyValue = ALGORITHM_DESCRIPTIONS[value];
    }
    return { claim, value: formattedValue, friendlyValue, claimDescription: CLAIM_DESCRIPTIONS[claim] };
  });
}

function base32Bytes(value) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const normalized = value.toUpperCase().replace(/=+$/, '');
  if (!normalized || /[^A-Z2-7]/.test(normalized)) {
    throw new Error('Invalid Base32 secret');
  }
  let bits = 0;
  let count = 0;
  const bytes = [];
  for (const char of normalized) {
    bits = (bits << 5) | alphabet.indexOf(char);
    count += 5;
    if (count >= 8) {
      count -= 8;
      bytes.push((bits >>> count) & 255);
    }
  }
  return Buffer.from(bytes);
}

function hotp(secret, counter) {
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac('sha1', base32Bytes(secret)).update(message).digest();
  const offset = digest.at(-1) & 15;
  return String((digest.readUInt32BE(offset) & 0x7FFF_FFFF) % 1_000_000).padStart(6, '0');
}

function randomIndex(max) {
  const range = 2 ** 32;
  const limit = range - (range % max);
  let value;
  do {
    value = randomBytes(4).readUInt32BE();
  } while (value >= limit);
  return value % max;
}

async function createServer() {
  const server = new McpServer({ name: 'KillerTools MCP Local', version: '0.1.0' });
  registerBrowserCompanion(server);
  await registerLocalWorkerTools(server);

  server.registerTool('hash_text_private', {
    description: 'Hash private text locally using the KillerTools hash algorithms.',
    inputSchema: { value: text, algorithm: z.enum(algorithms).default('SHA256'), encoding: z.enum(encodings).default('Hex') },
  }, async ({ value, algorithm, encoding }) => result({ hash: encodeWords(cryptoJs[algorithm](value), encoding) }));

  server.registerTool('hmac_private', {
    description: 'Calculate an HMAC locally using the KillerTools algorithms.',
    inputSchema: { value: text, secret: text, algorithm: z.enum(algorithms).default('SHA256'), encoding: z.enum(encodings).default('Hex') },
  }, async ({ value, secret, algorithm, encoding }) => result({ hmac: encodeWords(cryptoJs[`Hmac${algorithm}`](value, secret), encoding) }));

  server.registerTool('crypt_text_private', {
    description: 'Encrypt or decrypt text locally with the same CryptoJS algorithms as KillerTools.',
    inputSchema: { value: text, secret: text, algorithm: z.enum(['AES', 'TripleDES', 'Rabbit', 'RC4']).default('AES'), action: z.enum(['encrypt', 'decrypt']) },
  }, async ({ value, secret, algorithm, action }) => {
    try {
      const output = action === 'encrypt'
        ? cryptoJs[algorithm].encrypt(value, secret).toString()
        : cryptoJs[algorithm].decrypt(value, secret).toString(cryptoJs.enc.Utf8);
      return result({ output });
    }
    catch { return error('Unable to process encrypted text'); }
  });

  server.registerTool('bcrypt_private', {
    description: 'Hash or compare a string with bcrypt locally.',
    inputSchema: { value: text, action: z.enum(['hash', 'compare']), rounds: z.number().int().min(4).max(14).default(10), hash: z.string().max(128).optional() },
  }, async ({ value, action, rounds, hash: existing }) => {
    try {
      if (action === 'compare') {
        return existing ? result({ matches: await compare(value, existing) }) : error('A bcrypt hash is required');
      }
      return result({ hash: await hash(value, rounds) });
    }
    catch { return error('Invalid bcrypt input'); }
  });

  server.registerTool('bip39_private', {
    description: 'Generate a mnemonic or convert between entropy and a mnemonic locally using the KillerTools BIP39 library.',
    inputSchema: {
      entropy: z.string().regex(/^(?:[0-9a-f]{16}|[0-9a-f]{20}|[0-9a-f]{24}|[0-9a-f]{28}|[0-9a-f]{32})$/i).optional(),
      mnemonic: z.string().min(1).max(512).optional(),
      language: z.enum(Object.keys(langs)).default('English'),
    },
  }, async ({ entropy, mnemonic, language }) => {
    try {
      if (entropy && mnemonic) {
        return error('Provide entropy or a mnemonic, not both');
      }
      if (mnemonic) {
        return result({ entropy: bip39.mnemonicToEntropy(mnemonic, langs[language]), mnemonic });
      }
      const source = entropy ?? bip39.generateEntropy();
      return result({ entropy: source, mnemonic: bip39.entropyToMnemonic(source, langs[language]) });
    }
    catch { return error('Invalid BIP39 input'); }
  });

  server.registerTool('parse_jwt_private', {
    description: 'Decode a JWT locally without claiming to verify its signature.',
    inputSchema: { token: z.string().min(3).max(16384) },
  }, async ({ token }) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return error('Invalid JWT structure');
      }
      const header = decodeJwtPart(parts[0]);
      const payload = decodeJwtPart(parts[1]);
      return result({ header, payload, headerClaims: describeClaims(header), payloadClaims: describeClaims(payload), signatureVerified: false });
    }
    catch { return error('Invalid JWT'); }
  });

  server.registerTool('otp_private', {
    description: 'Generate or verify a six-digit HOTP or TOTP code locally.',
    inputSchema: { secret: z.string().min(8).max(128), mode: z.enum(['totp', 'hotp']).default('totp'), counter: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).optional(), timeStep: z.number().int().min(15).max(300).default(30), code: z.string().regex(/^\d{6}$/).optional() },
  }, async ({ secret, mode, counter, timeStep, code }) => {
    try {
      const current = mode === 'totp' ? Math.floor(Date.now() / 1000 / timeStep) : counter;
      if (current === undefined) {
        return error('A counter is required for HOTP');
      }
      const generated = hotp(secret, current);
      return result(code ? { matches: code === generated } : { code: generated, counter: current });
    }
    catch { return error('Invalid OTP secret'); }
  });

  server.registerTool('generate_otp_secret_private', {
    description: 'Generate a random Base32 OTP secret and an otpauth URI locally.',
    inputSchema: { issuer: z.string().min(1).max(128).default('killer-tools'), account: z.string().min(1).max(128).default('demo-user') },
  }, async ({ issuer, account }) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const secret = Array.from({ length: 16 }, () => alphabet[randomIndex(alphabet.length)]).join('');
    const uri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?issuer=${encodeURIComponent(issuer)}&secret=${secret}&algorithm=SHA1&digits=6&period=30`;
    return result({ secret, uri });
  });

  server.registerTool('generate_password_private', {
    description: 'Generate a password or passphrase locally with the KillerTools modes.',
    inputSchema: {
      mode: z.enum(['random', 'passphrase', 'pronounceable', 'format']).default('random'),
      length: z.number().int().min(8).max(128).default(20),
      uppercase: z.boolean().default(true),
      lowercase: z.boolean().default(true),
      numbers: z.boolean().default(true),
      symbols: z.boolean().default(true),
      excludeAmbiguous: z.boolean().default(true),
      requireOneOfEach: z.boolean().default(true),
      wordCount: z.number().int().min(1).max(16).default(6),
      wordSeparator: z.string().max(8).default('-'),
      capitalizeWords: z.boolean().default(true),
      appendNumber: z.boolean().default(false),
      format: z.enum(['hex', 'base64', 'base64url', 'uuid']).default('hex'),
    },
  }, async ({ mode, length, uppercase, lowercase, numbers, symbols, excludeAmbiguous, requireOneOfEach, wordCount, wordSeparator, capitalizeWords, appendNumber, format }) => {
    if (mode === 'passphrase') {
      const words = Array.from({ length: wordCount }, () => {
        const word = effLongWordlist[randomIndex(effLongWordlist.length)];
        return capitalizeWords ? word.charAt(0).toUpperCase() + word.slice(1) : word;
      });
      if (appendNumber) {
        words.push(String(randomIndex(100)).padStart(2, '0'));
      }
      return result({ password: words.join(wordSeparator) });
    }
    if (mode === 'pronounceable') {
      const consonants = 'bcdfghjkmnpqrstvwxz';
      const vowels = 'aeiouy';
      let password = Array.from({ length }, (_, index) => {
        const alphabet = index % 2 === 0 ? consonants : vowels;
        return alphabet[randomIndex(alphabet.length)];
      }).join('');
      if (appendNumber) {
        password = password.slice(0, -2) + String(randomIndex(100)).padStart(2, '0');
      }
      return result({ password });
    }
    if (mode === 'format') {
      if (format === 'uuid') {
        return result({ password: randomUUID() });
      }
      const byteLength = format === 'hex' ? Math.ceil(length / 2) : length;
      const bytes = randomBytes(byteLength);
      let password;
      if (format === 'hex') {
        password = bytes.toString('hex').slice(0, length);
      }
      else if (format === 'base64') {
        password = bytes.toString('base64').slice(0, length);
      }
      else {
        password = bytes.toString('base64url').slice(0, length);
      }
      return result({ password });
    }
    const ambiguous = /[0O1lI|`'".,;:{}[\]()\\/]/g;
    const pools = [
      uppercase ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
      lowercase ? 'abcdefghijklmnopqrstuvwxyz' : '',
      numbers ? '0123456789' : '',
      symbols ? '!@#$%^&*()-_=+[]{};:,.<>/?' : '',
    ].map(pool => excludeAmbiguous ? pool.replace(ambiguous, '') : pool).filter(Boolean);
    const alphabet = pools.join('');
    if (!alphabet) {
      return error('Select at least one character set');
    }
    const characters = requireOneOfEach ? pools.map(pool => pool[randomIndex(pool.length)]) : [];
    while (characters.length < length) {
      characters.push(alphabet[randomIndex(alphabet.length)]);
    }
    for (let index = characters.length - 1; index > 0; index--) {
      const swap = randomIndex(index + 1);
      [characters[index], characters[swap]] = [characters[swap], characters[index]];
    }
    return result({ password: characters.join('') });
  });

  server.registerTool('analyze_password_private', {
    description: 'Estimate password strength and crack time locally using the KillerTools calculation.',
    inputSchema: { password: text },
  }, async ({ password }) => result(getPasswordCrackTimeEstimation({ password })));

  server.registerTool('generate_rsa_keypair_private', {
    description: 'Generate an RSA PEM key pair locally.',
    inputSchema: { bits: z.enum(['2048', '3072', '4096']).default('2048') },
  }, async ({ bits }) => {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: Number(bits),
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
    });
    return result({ publicKeyPem: publicKey, privateKeyPem: privateKey });
  });

  server.registerTool('encode_file_base64_local', {
    description: 'Read a local file and return a bounded Base64 representation.',
    inputSchema: { path: z.string().min(1).max(1024) },
  }, async ({ path }) => {
    try {
      const details = await stat(path);
      if (!details.isFile() || details.size > 32768) {
        return error('File exceeds 32 KiB limit');
      }
      const bytes = await readFile(path);
      if (bytes.length > 32768) {
        return error('File exceeds 32 KiB limit');
      }
      return result({ base64: bytes.toString('base64'), byteLength: bytes.length });
    }
    catch { return error('Unable to read file'); }
  });

  server.registerTool('decode_file_base64_local', {
    description: 'Decode Base64 to a new local file. Existing files are never overwritten.',
    inputSchema: { path: z.string().min(1).max(1024), base64: z.string().min(1).max(43692) },
  }, async ({ path, base64 }) => {
    if (!/^(?:[a-z0-9+/]{4})*(?:[a-z0-9+/]{2}==|[a-z0-9+/]{3}=)?$/i.test(base64)) {
      return error('Invalid Base64');
    }
    const bytes = Buffer.from(base64, 'base64');
    if (bytes.length > 32768) {
      return error('Decoded file exceeds 32 KiB limit');
    }
    try {
      await writeFile(path, bytes, { flag: 'wx' });
      return result({ path, byteLength: bytes.length });
    }
    catch { return error('Unable to create file at the requested path'); }
  });

  server.registerTool('check_pdf_signatures_local', {
    description: 'Read a local PDF and return signatures found by the KillerTools PDF signature reader.',
    inputSchema: { path: z.string().min(1).max(1024) },
  }, async ({ path }) => {
    try {
      const details = await stat(path);
      if (!details.isFile() || details.size > 8_000_000) {
        return error('PDF exceeds 8 MB limit');
      }
      const bytes = await readFile(path);
      if (bytes.length > 8_000_000) {
        return error('PDF exceeds 8 MB limit');
      }
      const parsed = verifyPdf(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
      const output = JSON.stringify({ signatures: parsed.signatures });
      return output.length <= 65536 ? result({ signatures: parsed.signatures }) : error('Signature details exceed output limit');
    }
    catch { return error('Unable to inspect PDF signatures'); }
  });

  return server;
}

serveStdio(createServer);
