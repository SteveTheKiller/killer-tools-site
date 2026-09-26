import type { McpServer } from '@modelcontextprotocol/server';
import type { CountryCode } from 'libphonenumber-js';
import lookup from 'country-code-lookup';
import { getCountries, parsePhoneNumber } from 'libphonenumber-js/max';
import { z } from 'zod';

const countries = getCountries();

export function registerPhoneTools(server: McpServer) {
  server.registerTool('parse_phone_number', {
    description: 'Parse and format a phone number as shown by KillerTools Phone Parser.',
    inputSchema: {
      phone: z.string().trim().min(1).max(64).regex(/^[0-9 +\-()]+$/),
      defaultCountry: z.string().length(2).optional(),
    },
  }, async ({ phone, defaultCountry }) => {
    if (defaultCountry && !countries.includes(defaultCountry as CountryCode)) {
      return { content: [{ type: 'text' as const, text: 'Unknown default country code' }], isError: true };
    }
    try {
      const parsed = parsePhoneNumber(phone, defaultCountry as CountryCode | undefined);
      return { content: [{ type: 'text' as const, text: JSON.stringify({
        countryCode: parsed.country ?? null,
        country: parsed.country ? lookup.byIso(parsed.country)?.country ?? null : null,
        callingCode: `+${parsed.countryCallingCode}`,
        isValid: parsed.isValid(),
        isPossible: parsed.isPossible(),
        type: parsed.getType() ?? 'Unknown',
        international: parsed.formatInternational(),
        national: parsed.formatNational(),
        e164: parsed.format('E.164'),
        rfc3966: parsed.format('RFC3966'),
      }) }] };
    }
    catch {
      return { content: [{ type: 'text' as const, text: 'Invalid phone number' }], isError: true };
    }
  });
}
