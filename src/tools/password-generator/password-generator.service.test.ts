import { describe, expect, it } from 'vitest';
import {
  createToken,
  defaultOptions,
  estimateCrackTime,
  generatePassword,
  getEntropyBits,
  toPhonetic,
} from './password-generator.service';

describe('password-generator service', () => {
  describe('generatePassword / random mode', () => {
    it('honors the requested length', () => {
      const pw = generatePassword({ ...defaultOptions, mode: 'random', length: 24 });
      expect(pw).toHaveLength(24);
    });

    it('returns empty string when all classes are off', () => {
      const pw = generatePassword({
        ...defaultOptions,
        mode: 'random',
        length: 16,
        withUppercase: false,
        withLowercase: false,
        withNumbers: false,
        withSymbols: false,
      });
      expect(pw).toBe('');
    });

    it('excludes ambiguous chars when requested', () => {
      for (let i = 0; i < 10; i++) {
        const pw = generatePassword({
          ...defaultOptions,
          mode: 'random',
          length: 256,
          withSymbols: true,
          excludeAmbiguous: true,
        });
        expect(pw).not.toMatch(/[0O1lI|`'".,;:{}\[\]()\\\/]/);
      }
    });

    it('requires at least one of each selected class', () => {
      for (let i = 0; i < 20; i++) {
        const pw = generatePassword({
          ...defaultOptions,
          mode: 'random',
          length: 12,
          withUppercase: true,
          withLowercase: true,
          withNumbers: true,
          withSymbols: true,
          requireOneOfEach: true,
          excludeAmbiguous: false,
        });
        expect(pw).toMatch(/[A-Z]/);
        expect(pw).toMatch(/[a-z]/);
        expect(pw).toMatch(/[0-9]/);
        expect(pw).toMatch(/[!@#$%^&*()\-_=+\[\]{};:,.<>/?]/);
      }
    });

    it('only uses numeric chars when only numbers are enabled', () => {
      const pw = generatePassword({
        ...defaultOptions,
        mode: 'random',
        length: 6,
        withUppercase: false,
        withLowercase: false,
        withNumbers: true,
        withSymbols: false,
      });
      expect(pw).toMatch(/^\d{6}$/);
    });
  });

  describe('generatePassword / passphrase mode', () => {
    it('produces the requested number of words', () => {
      const pw = generatePassword({
        ...defaultOptions,
        mode: 'passphrase',
        wordCount: 5,
        wordSeparator: '-',
        capitalizeWords: false,
        appendNumber: false,
      });
      expect(pw.split('-').length).toBe(5);
    });

    it('capitalizes words when requested', () => {
      const pw = generatePassword({
        ...defaultOptions,
        mode: 'passphrase',
        wordCount: 3,
        wordSeparator: '-',
        capitalizeWords: true,
        appendNumber: false,
      });
      for (const word of pw.split('-')) {
        expect(word[0]).toBe(word[0].toUpperCase());
      }
    });

    it('appends a number when requested', () => {
      const pw = generatePassword({
        ...defaultOptions,
        mode: 'passphrase',
        wordCount: 3,
        wordSeparator: '.',
        capitalizeWords: false,
        appendNumber: true,
      });
      const parts = pw.split('.');
      expect(parts).toHaveLength(4);
      expect(parts[3]).toMatch(/^\d{2}$/);
    });
  });

  describe('generatePassword / pronounceable mode', () => {
    it('alternates consonants and vowels', () => {
      const pw = generatePassword({
        ...defaultOptions,
        mode: 'pronounceable',
        length: 10,
        appendNumber: false,
      });
      expect(pw).toHaveLength(10);
      expect(pw).toMatch(/^[bcdfghjkmnpqrstvwxz][aeiouy][bcdfghjkmnpqrstvwxz][aeiouy]/);
    });

    it('replaces last two chars with digits when appendNumber is true', () => {
      const pw = generatePassword({
        ...defaultOptions,
        mode: 'pronounceable',
        length: 12,
        appendNumber: true,
      });
      expect(pw).toHaveLength(12);
      expect(pw.slice(-2)).toMatch(/^\d{2}$/);
    });
  });

  describe('generatePassword / format mode', () => {
    it('produces hex of requested length', () => {
      const pw = generatePassword({ ...defaultOptions, mode: 'format', format: 'hex', length: 32 });
      expect(pw).toMatch(/^[0-9a-f]{32}$/);
    });

    it('produces a valid UUID v4', () => {
      const pw = generatePassword({ ...defaultOptions, mode: 'format', format: 'uuid' });
      expect(pw).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('produces base64url without padding or unsafe chars', () => {
      const pw = generatePassword({ ...defaultOptions, mode: 'format', format: 'base64url', length: 32 });
      expect(pw).toHaveLength(32);
      expect(pw).toMatch(/^[A-Za-z0-9\-_]+$/);
    });
  });

  describe('getEntropyBits', () => {
    it('returns 0 for empty string', () => {
      expect(getEntropyBits('', defaultOptions)).toBe(0);
    });

    it('returns ~128 bits for a 20-char password with all 4 classes', () => {
      const opts = { ...defaultOptions, mode: 'random' as const, excludeAmbiguous: false };
      const pw = 'Aa1!bcdefghijklmnopq';
      const bits = getEntropyBits(pw, opts);
      // charset ~86, 20 chars => ~128 bits.
      expect(bits).toBeGreaterThan(120);
      expect(bits).toBeLessThan(135);
    });

    it('returns ~77 bits for a 6-word passphrase', () => {
      const opts = { ...defaultOptions, mode: 'passphrase' as const, wordCount: 6, appendNumber: false };
      const bits = getEntropyBits('foo-bar-baz-qux-quux-corge', opts);
      expect(bits).toBeGreaterThan(75);
      expect(bits).toBeLessThan(80);
    });
  });

  describe('estimateCrackTime', () => {
    it('returns instantly for 0 entropy', () => {
      expect(estimateCrackTime(0)).toBe('Instantly');
    });

    it('returns a human-readable value for large entropy', () => {
      expect(estimateCrackTime(128)).toMatch(/year|century|millennium/);
    });
  });

  describe('toPhonetic', () => {
    it('converts letters to NATO words', () => {
      expect(toPhonetic('Abc')).toBe('Alpha bravo charlie');
    });

    it('converts digits', () => {
      expect(toPhonetic('A1')).toBe('Alpha One');
    });

    it('names common symbols', () => {
      expect(toPhonetic('!@')).toBe('bang at');
    });
  });

  describe('createToken (back-compat)', () => {
    it('generates a string of the requested length', () => {
      expect(createToken({ length: 16 })).toHaveLength(16);
    });

    it('respects a custom alphabet', () => {
      const token = createToken({ length: 32, alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567' });
      expect(token).toMatch(/^[A-Z2-7]{32}$/);
    });

    it('returns empty string when no classes are enabled and no alphabet given', () => {
      expect(createToken({
        withUppercase: false,
        withLowercase: false,
        withNumbers: false,
        withSymbols: false,
        length: 10,
      })).toBe('');
    });
  });
});
