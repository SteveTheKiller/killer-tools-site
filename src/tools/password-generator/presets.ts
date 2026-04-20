import type { PasswordOptions } from './password-generator.service';

export interface Preset {
  id: string
  label: string
  description: string
  options: Partial<PasswordOptions>
}

// MSP-friendly defaults. All presets default to mode: 'random' unless noted.
export const presets: Preset[] = [
  {
    id: 'custom',
    label: 'Custom',
    description: 'Hand-tuned settings below.',
    options: {},
  },
  {
    id: 'local-admin',
    label: 'Local admin',
    description: '20 chars, all 4 classes, no ambiguous chars. Good for LAPS-style rotations.',
    options: {
      mode: 'random',
      length: 20,
      withUppercase: true,
      withLowercase: true,
      withNumbers: true,
      withSymbols: true,
      excludeAmbiguous: true,
      requireOneOfEach: true,
      format: 'plain',
    },
  },
  {
    id: 'service-account',
    label: 'Service account',
    description: '32 chars, letters + numbers only. No symbols that break SQL/XML/cmd escaping.',
    options: {
      mode: 'random',
      length: 32,
      withUppercase: true,
      withLowercase: true,
      withNumbers: true,
      withSymbols: false,
      excludeAmbiguous: true,
      requireOneOfEach: true,
      format: 'plain',
    },
  },
  {
    id: 'wifi-psk',
    label: 'Wi-Fi PSK',
    description: '16 chars, URL/QR-safe, no ambiguous chars. Easy to read off a label.',
    options: {
      mode: 'random',
      length: 16,
      withUppercase: true,
      withLowercase: true,
      withNumbers: true,
      withSymbols: false,
      excludeAmbiguous: true,
      requireOneOfEach: true,
      format: 'plain',
    },
  },
  {
    id: 'pin-6',
    label: 'PIN (6 digits)',
    description: '6-digit numeric PIN.',
    options: {
      mode: 'random',
      length: 6,
      withUppercase: false,
      withLowercase: false,
      withNumbers: true,
      withSymbols: false,
      excludeAmbiguous: false,
      requireOneOfEach: false,
      format: 'plain',
    },
  },
  {
    id: 'api-key',
    label: 'API key (hex)',
    description: '64-char hex key, good for bearer tokens or config secrets.',
    options: {
      mode: 'format',
      format: 'hex',
      length: 64,
    },
  },
  {
    id: 'uuid',
    label: 'UUID v4',
    description: 'RFC 4122 UUID v4.',
    options: {
      mode: 'format',
      format: 'uuid',
    },
  },
  {
    id: 'passphrase-4',
    label: 'Passphrase (4 words)',
    description: '4-word EFF diceware passphrase. ~51 bits of entropy.',
    options: {
      mode: 'passphrase',
      wordCount: 4,
      wordSeparator: '-',
      capitalizeWords: true,
      appendNumber: false,
    },
  },
  {
    id: 'passphrase-6',
    label: 'Passphrase (6 words)',
    description: '6-word EFF diceware passphrase. ~77 bits of entropy.',
    options: {
      mode: 'passphrase',
      wordCount: 6,
      wordSeparator: '-',
      capitalizeWords: true,
      appendNumber: true,
    },
  },
  {
    id: 'pronounceable',
    label: 'Pronounceable',
    description: '16-char consonant-vowel pattern. Easier to read over the phone.',
    options: {
      mode: 'pronounceable',
      length: 16,
      appendNumber: true,
    },
  },
];

export function getPreset(id: string): Preset | undefined {
  return presets.find(p => p.id === id);
}
