import { McpServer } from '@modelcontextprotocol/server';
import { createMcpHandler } from 'agents/mcp/server';
import { Netmask } from 'netmask';
import { UAParser } from 'ua-parser-js';
import { z } from 'zod';
import { convertCase } from '../../src/tools/case-converter/case-converter.models';
import { convertBase } from '../../src/tools/integer-base-converter/integer-base-converter.model';
import { ipv4ToInt, isValidIpv4 } from '../../src/tools/ipv4-address-converter/ipv4-address-converter.service';
import { calculateCidr } from '../../src/tools/ipv4-range-expander/ipv4-range-expander.service';
import { getIPClass } from '../../src/tools/ipv4-subnet-calculator/ipv4-subnet-calculator.models';
import { convertArrayToCsv } from '../../src/tools/json-to-csv/json-to-csv.service';
import { generateLoremIpsum } from '../../src/tools/lorem-ipsum-generator/lorem-ipsum-generator.service';
import { percentageChange, percentageOf, percentageRatio } from '../../src/tools/percentage-calculator/percentage-calculator.service';
import { arabicToRoman, romanToArabic } from '../../src/tools/roman-numeral-converter/roman-numeral-converter.service';
import {
  convertCelsiusToKelvin,
  convertDelisleToKelvin,
  convertFahrenheitToKelvin,
  convertKelvinToCelsius,
  convertKelvinToDelisle,
  convertKelvinToFahrenheit,
  convertKelvinToNewton,
  convertKelvinToRankine,
  convertKelvinToReaumur,
  convertKelvinToRomer,
  convertNewtonToKelvin,
  convertRankineToKelvin,
  convertReaumurToKelvin,
  convertRomerToKelvin,
} from '../../src/tools/temperature-converter/temperature-converter.models';
import { getTextStatistics } from '../../src/tools/text-statistics/text-statistics.service';
import { convertAsciiBinaryToText, convertTextToAsciiBinary } from '../../src/tools/text-to-binary/text-to-binary.models';
import { textToNatoAlphabet } from '../../src/tools/text-to-nato-alphabet/text-to-nato-alphabet.service';
import { parseUrl } from '../../src/tools/url-parser/url-parser.service';
import { base64ToText, textToBase64 } from '../../src/utils/base64';
import { formatBytes } from '../../src/utils/convert';
import { registerAsciiArt } from './ascii-art';
import { registerCveLookup } from './cve-lookup';
import { registerDateTime } from './date-time';
import { registerDocumentTools } from './document-tools';
import { registerDomainLookup } from './domain-lookup';
import { registerEmailHeaders } from './email-headers';
import { registerEmailRecords } from './email-records';
import { registerEmoji } from './emoji';
import { registerFilmDevelopment } from './film-development';
import { registerFormatParsers } from './format-parsers';
import { registerGifSearch } from './gif-search';
import { registerIpv6Ula } from './ipv6-ula';
import { registerKillerModules } from './killer-modules';
import { registerKillerScripts } from './killer-scripts';
import { registerMacVendor } from './mac-vendor';
import { registerMathEvaluator } from './math-evaluator';
import { registerMetaTags } from './meta-tags';
import { registerPhoneTools } from './phone-tools';
import { registerPhotoCalculators } from './photo-calculators';
import { registerPowerShellBuilder } from './powershell-builder';
import { registerQrCode } from './qr-code';
import { registerReferenceLookups } from './reference-lookups';
import { registerRegexTester } from './regex-tester';
import { registerSimpleTools } from './simple-tools';
import { registerStructuredText } from './structured-text';
import { registerTextDiff } from './text-diff';
import { registerTextFormatters } from './text-formatters';

const inputText = z.string().max(4096);
const maxRequestBytes = 65536;
const temperatureScales = ['kelvin', 'celsius', 'fahrenheit', 'rankine', 'delisle', 'newton', 'reaumur', 'romer'] as const;
type TemperatureScale = typeof temperatureScales[number];
const temperatureConversions: Record<TemperatureScale, { toKelvin: (value: number) => number, fromKelvin: (value: number) => number }> = {
  kelvin: { toKelvin: value => value, fromKelvin: value => value },
  celsius: { toKelvin: convertCelsiusToKelvin, fromKelvin: convertKelvinToCelsius },
  fahrenheit: { toKelvin: convertFahrenheitToKelvin, fromKelvin: convertKelvinToFahrenheit },
  rankine: { toKelvin: convertRankineToKelvin, fromKelvin: convertKelvinToRankine },
  delisle: { toKelvin: convertDelisleToKelvin, fromKelvin: convertKelvinToDelisle },
  newton: { toKelvin: convertNewtonToKelvin, fromKelvin: convertKelvinToNewton },
  reaumur: { toKelvin: convertReaumurToKelvin, fromKelvin: convertKelvinToReaumur },
  romer: { toKelvin: convertRomerToKelvin, fromKelvin: convertKelvinToRomer },
};

interface Env {
  REQUEST_LIMITER: {
    limit: (options: { key: string }) => Promise<{ success: boolean }>
  }
}

function result(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value) }] };
}

async function boundedRequest(request: Request): Promise<Request | Response> {
  if (request.method !== 'POST' || !request.body) {
    return request;
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    size += value.byteLength;
    if (size > maxRequestBytes) {
      await reader.cancel();
      return new Response('Request too large', { status: 413 });
    }
    chunks.push(value);
  }

  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const headers = new Headers(request.headers);
  headers.delete('content-length');
  return new Request(request, { body, headers });
}

function createServer() {
  const server = new McpServer({ name: 'KillerTools MCP', version: '0.1.0' });
  registerAsciiArt(server);
  registerCveLookup(server);
  registerDateTime(server);
  registerDomainLookup(server);
  registerDocumentTools(server);
  registerEmailRecords(server);
  registerEmailHeaders(server);
  registerEmoji(server);
  registerFilmDevelopment(server);
  registerFormatParsers(server);
  registerGifSearch(server);
  registerIpv6Ula(server);
  registerKillerModules(server);
  registerKillerScripts(server);
  registerMetaTags(server);
  registerMathEvaluator(server);
  registerMacVendor(server);
  registerPhotoCalculators(server);
  registerQrCode(server);
  registerPowerShellBuilder(server);
  registerPhoneTools(server);
  registerReferenceLookups(server);
  registerRegexTester(server);
  registerSimpleTools(server);
  registerStructuredText(server);
  registerTextFormatters(server);
  registerTextDiff(server);

  server.registerTool('convert_case', {
    description: 'Return the case conversions shown by the KillerTools Case Converter.',
    inputSchema: { text: inputText },
  }, async ({ text }) => result(convertCase(text)));

  server.registerTool('parse_user_agent', {
    description: 'Parse a user agent string using the KillerTools User Agent Parser.',
    inputSchema: { userAgent: z.string().trim().min(1).max(1024) },
  }, async ({ userAgent }) => {
    const parsed = UAParser(userAgent);
    return result({ browser: parsed.browser, engine: parsed.engine, os: parsed.os, device: parsed.device, cpu: parsed.cpu });
  });

  server.registerTool('convert_integer_base', {
    description: 'Convert a nonnegative integer between bases 2 and 64 using the KillerTools converter.',
    inputSchema: {
      value: z.string().min(1).max(128),
      fromBase: z.number().int().min(2).max(64),
      toBase: z.number().int().min(2).max(64),
    },
  }, async ({ value, fromBase, toBase }) => {
    try {
      return result({ value: convertBase({ value, fromBase, toBase }) });
    }
    catch {
      return { content: [{ type: 'text' as const, text: 'Invalid digit for input base' }], isError: true };
    }
  });

  server.registerTool('expand_ipv4_range', {
    description: 'Find the smallest covering CIDR block for an IPv4 address range using KillerTools.',
    inputSchema: { startIp: z.string().max(15), endIp: z.string().max(15) },
  }, async ({ startIp, endIp }) => {
    if (!isValidIpv4({ ip: startIp }) || !isValidIpv4({ ip: endIp })
      || ipv4ToInt({ ip: startIp }) > ipv4ToInt({ ip: endIp })) {
      return { content: [{ type: 'text' as const, text: 'Invalid IPv4 address range' }], isError: true };
    }
    return result(calculateCidr({ startIp, endIp }));
  });

  server.registerTool('calculate_ipv4_subnet', {
    description: 'Calculate the IPv4 network information shown by KillerTools Subnet Calculator.',
    inputSchema: { address: z.string().min(1).max(32) },
  }, async ({ address }) => {
    try {
      const network = new Netmask(address.trim());
      return result({
        cidr: network.toString(),
        networkAddress: network.base,
        networkMask: network.mask,
        prefixLength: network.bitmask,
        wildcardMask: network.hostmask,
        size: network.size,
        usableHosts: network.size <= 2 ? (network.size === 2 ? 0 : 1) : network.size - 2,
        firstAddress: network.first,
        lastAddress: network.last,
        broadcastAddress: network.broadcast,
        ipClass: getIPClass({ ip: network.base }),
      });
    }
    catch {
      return { content: [{ type: 'text' as const, text: 'Invalid IPv4 subnet' }], isError: true };
    }
  });

  server.registerTool('encode_base64', {
    description: 'Encode text as standard or URL-safe Base64 using the KillerTools converter.',
    inputSchema: { text: inputText, urlSafe: z.boolean().optional() },
  }, async ({ text, urlSafe }) => result({ encoded: textToBase64(text, { makeUrlSafe: urlSafe }) }));

  server.registerTool('decode_base64', {
    description: 'Decode a standard or URL-safe Base64 string using the KillerTools converter.',
    inputSchema: { encoded: inputText, urlSafe: z.boolean().optional() },
  }, async ({ encoded, urlSafe }) => {
    try {
      return result({ text: base64ToText(encoded, { makeUrlSafe: urlSafe }) });
    }
    catch {
      return { content: [{ type: 'text' as const, text: 'Invalid Base64 input' }], isError: true };
    }
  });

  server.registerTool('text_to_ascii_binary', {
    description: 'Convert text to the binary representation shown by the KillerTools Text to Binary tool.',
    inputSchema: { text: inputText },
  }, async ({ text }) => result({ binary: convertTextToAsciiBinary(text) }));

  server.registerTool('ascii_binary_to_text', {
    description: 'Convert ASCII binary bytes to text using the KillerTools Text to Binary tool.',
    inputSchema: { binary: inputText },
  }, async ({ binary }) => {
    try {
      return result({ text: convertAsciiBinaryToText(binary) });
    }
    catch {
      return { content: [{ type: 'text' as const, text: 'Invalid binary input' }], isError: true };
    }
  });

  server.registerTool('arabic_to_roman', {
    description: 'Convert an integer from 1 to 3999 to a Roman numeral using the KillerTools converter.',
    inputSchema: { number: z.number().int().min(1).max(3999) },
  }, async ({ number }) => result({ roman: arabicToRoman(number) }));

  server.registerTool('roman_to_arabic', {
    description: 'Convert a valid Roman numeral to an integer using the KillerTools converter.',
    inputSchema: { roman: z.string().min(1).max(32) },
  }, async ({ roman }) => {
    const number = romanToArabic(roman);
    return number === null
      ? { content: [{ type: 'text' as const, text: 'Invalid Roman numeral' }], isError: true }
      : result({ number });
  });

  server.registerTool('text_statistics', {
    description: 'Count characters, words, lines, and UTF-8 bytes as shown by KillerTools Text Statistics.',
    inputSchema: { text: inputText },
  }, async ({ text }) => {
    const statistics = getTextStatistics(text);
    return result({ ...statistics, byteSizeDisplay: formatBytes(statistics.byteSize) });
  });

  server.registerTool('text_to_nato_alphabet', {
    description: 'Convert text to NATO phonetic words using the KillerTools converter.',
    inputSchema: { text: inputText },
  }, async ({ text }) => result({ nato: textToNatoAlphabet({ text }).split(' ').filter(Boolean).join(' ') }));

  server.registerTool('convert_temperature', {
    description: 'Convert a temperature among the eight scales shown by the KillerTools converter.',
    inputSchema: { value: z.number().finite().min(-1_000_000_000).max(1_000_000_000), scale: z.enum(temperatureScales) },
  }, async ({ value, scale }) => {
    const kelvin = temperatureConversions[scale].toKelvin(value);
    const conversions = Object.fromEntries(temperatureScales.map(target => [
      target,
      target === scale ? value : Math.floor(temperatureConversions[target].fromKelvin(kelvin) * 100) / 100,
    ]));
    return result(conversions);
  });

  server.registerTool('calculate_percentage', {
    description: 'Calculate a percent of a total, a part as a percent of a total, or percentage change using KillerTools.',
    inputSchema: {
      mode: z.enum(['percent_of', 'what_percent', 'change']),
      x: z.number().finite().min(-1_000_000_000).max(1_000_000_000),
      y: z.number().finite().min(-1_000_000_000).max(1_000_000_000),
    },
  }, async ({ mode, x, y }) => {
    const value = mode === 'percent_of'
      ? percentageOf(x, y)
      : mode === 'what_percent'
        ? percentageRatio(x, y)
        : percentageChange(x, y);
    return value === ''
      ? { content: [{ type: 'text' as const, text: 'The denominator must not be zero' }], isError: true }
      : result({ value });
  });

  server.registerTool('json_to_csv', {
    description: 'Convert an array of JSON objects to CSV using the KillerTools converter.',
    inputSchema: { rows: z.array(z.record(z.string(), z.unknown())).min(1).max(100) },
  }, async ({ rows }) => {
    const csv = convertArrayToCsv({ array: rows });
    return csv.length > 65536
      ? { content: [{ type: 'text' as const, text: 'CSV output is too large' }], isError: true }
      : result({ csv });
  });

  server.registerTool('generate_lorem_ipsum', {
    description: 'Generate bounded Lorem Ipsum text using the KillerTools generator.',
    inputSchema: {
      paragraphCount: z.number().int().min(1).max(10).default(1),
      sentencePerParagraph: z.number().int().min(1).max(10).default(3),
      wordCount: z.number().int().min(1).max(20).default(10),
      startWithLoremIpsum: z.boolean().default(true),
      asHTML: z.boolean().default(false),
    },
  }, async options => result({ text: generateLoremIpsum(options) }));

  server.registerTool('parse_url', {
    description: 'Parse a URL into its parts and query parameters using KillerTools URL Parser.',
    inputSchema: { url: inputText },
  }, async ({ url }) => {
    const parsed = parseUrl(url);
    return parsed
      ? result({
          protocol: parsed.protocol,
          hostname: parsed.hostname,
          port: parsed.port,
          username: parsed.username,
          password: parsed.password,
          pathname: parsed.pathname,
          search: parsed.search,
          hash: parsed.hash,
          searchParams: Array.from(parsed.searchParams.entries()),
        })
      : { content: [{ type: 'text' as const, text: 'Invalid URL' }], isError: true };
  });

  return server;
}

const handler = createMcpHandler(createServer, {
  route: '/',
  allowedHostnames: ['localhost', '127.0.0.1', 'mcp.killertools.net'],
  allowedOriginHostnames: ['localhost', '127.0.0.1', 'mcp.killertools.net'],
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (new URL(request.url).pathname !== '/') {
      return new Response('Not found', { status: 404 });
    }
    if (Number(request.headers.get('content-length')) > maxRequestBytes) {
      return new Response('Request too large', { status: 413 });
    }
    const key = request.headers.get('cf-connecting-ip') || 'local';
    const { success } = await env.REQUEST_LIMITER.limit({ key });
    if (!success) {
      return new Response('Rate limit exceeded', { status: 429 });
    }
    const bounded = await boundedRequest(request);
    if (bounded instanceof Response) {
      return bounded;
    }
    return handler(bounded, env, ctx);
  },
};
