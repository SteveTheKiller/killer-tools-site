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
import privacyPage from '../legal/privacy.html';
import termsPage from '../legal/terms.html';

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

// Human-readable tool titles for every hosted tool. Directory reviewers and MCP clients show the
// title instead of the snake_case name. Tools added elsewhere fall back to a title built from the name.
const toolTitles: Record<string, string> = {
  arabic_to_roman: 'Convert to Roman Numerals',
  ascii_binary_to_text: 'Convert Binary to Text',
  build_powershell_command: 'Build PowerShell Command',
  calculate_chmod: 'Calculate Chmod',
  calculate_depth_of_field: 'Calculate Depth of Field',
  calculate_exposure_equivalence: 'Calculate Equivalent Exposure',
  calculate_film_development: 'Calculate Film Development',
  calculate_ipv4_subnet: 'Calculate IPv4 Subnet',
  calculate_nd_exposure: 'Calculate ND Filter Exposure',
  calculate_percentage: 'Calculate Percentage',
  calculate_reciprocity: 'Calculate Reciprocity Failure',
  convert_case: 'Convert Text Case',
  convert_color: 'Convert Color',
  convert_date_time: 'Convert Date and Time',
  convert_integer_base: 'Convert Number Base',
  convert_json: 'Convert JSON',
  convert_temperature: 'Convert Temperature',
  convert_toml: 'Convert TOML',
  convert_xml_json: 'Convert XML and JSON',
  convert_yaml: 'Convert YAML',
  decode_base64: 'Decode Base64',
  describe_cron: 'Describe Cron Expression',
  diff_json: 'Compare JSON',
  diff_text: 'Compare Text',
  draw_ascii_text: 'Draw ASCII Text',
  encode_base64: 'Encode Base64',
  escape_html_entities: 'Escape HTML Entities',
  evaluate_math: 'Evaluate Math Expression',
  expand_ipv4_range: 'Expand IPv4 Range',
  format_json: 'Format JSON',
  format_sql: 'Format SQL',
  format_xml: 'Format XML',
  format_yaml: 'Format YAML',
  generate_dmarc_record: 'Generate DMARC Record',
  generate_ipv6_ula: 'Generate IPv6 ULA',
  generate_lorem_ipsum: 'Generate Lorem Ipsum',
  generate_meta_tags: 'Generate Meta Tags',
  generate_qr_code: 'Generate QR Code',
  generate_spf_record: 'Generate SPF Record',
  generate_svg_placeholder: 'Generate SVG Placeholder',
  generate_ulids: 'Generate ULIDs',
  generate_uuids: 'Generate UUIDs',
  get_powershell_cmdlet: 'Get PowerShell Cmdlet',
  json_to_csv: 'Convert JSON to CSV',
  list_film_development_options: 'List Film Development Options',
  list_film_stocks: 'List Film Stocks',
  list_killer_modules: 'List Killer Modules',
  list_killer_scripts: 'List Killer Scripts',
  lookup_cve: 'Look Up CVE',
  lookup_domain_dns: 'Look Up Domain DNS',
  lookup_domain_rdap: 'Look Up Domain Registration',
  lookup_exchange_ndr: 'Look Up Exchange NDR Code',
  lookup_group_policy: 'Look Up Group Policy',
  lookup_http_status: 'Look Up HTTP Status',
  lookup_m365_sku: 'Look Up Microsoft 365 SKU',
  lookup_mac_vendor: 'Look Up MAC Vendor',
  lookup_port_protocol: 'Look Up Port or Protocol',
  lookup_windows_error: 'Look Up Windows Error',
  lookup_windows_event: 'Look Up Windows Event',
  markdown_to_html: 'Convert Markdown to HTML',
  minify_json: 'Minify JSON',
  parse_email_headers: 'Parse Email Headers',
  parse_phone_number: 'Parse Phone Number',
  parse_url: 'Parse URL',
  parse_user_agent: 'Parse User Agent',
  roman_to_arabic: 'Convert from Roman Numerals',
  search_emoji: 'Search Emoji',
  search_gifs: 'Search GIFs',
  search_powershell_cmdlets: 'Search PowerShell Cmdlets',
  test_regex: 'Test Regular Expression',
  text_statistics: 'Count Text Statistics',
  text_to_ascii_binary: 'Convert Text to Binary',
  text_to_nato_alphabet: 'Convert Text to NATO Alphabet',
  unescape_html_entities: 'Unescape HTML Entities',
};

function withTitles(server: McpServer) {
  const register = server.registerTool.bind(server) as (name: string, config: any, callback: any) => unknown;
  (server as any).registerTool = (name: string, config: any, callback: any) => {
    const title: string = config.title ?? toolTitles[name] ?? name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return register(name, { ...config, title, annotations: { title, ...config.annotations } }, callback);
  };
  return server;
}

export function createServer(name = 'KillerTools MCP', directory = false) {
  const server = withTitles(new McpServer({ name, version: '0.1.0' }));
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
  if (!directory) {
    registerQrCode(server);
  }
  registerPowerShellBuilder(server);
  registerPhoneTools(server);
  registerReferenceLookups(server);
  registerRegexTester(server);
  registerSimpleTools(server);
  registerStructuredText(server);
  registerTextFormatters(server);
  registerTextDiff(server);

  server.registerTool('convert_case', {
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    description: 'Return the case conversions shown by the KillerTools Case Converter.',
    inputSchema: { text: inputText },
  }, async ({ text }) => result(convertCase(text)));

  server.registerTool('parse_user_agent', {
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    description: 'Parse a user agent string using the KillerTools User Agent Parser.',
    inputSchema: { userAgent: z.string().trim().min(1).max(1024) },
  }, async ({ userAgent }) => {
    const parsed = UAParser(userAgent);
    return result({ browser: parsed.browser, engine: parsed.engine, os: parsed.os, device: parsed.device, cpu: parsed.cpu });
  });

  server.registerTool('convert_integer_base', {
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
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
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
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
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
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
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    description: 'Encode text as standard or URL-safe Base64 using the KillerTools converter.',
    inputSchema: { text: inputText, urlSafe: z.boolean().optional() },
  }, async ({ text, urlSafe }) => result({ encoded: textToBase64(text, { makeUrlSafe: urlSafe }) }));

  server.registerTool('decode_base64', {
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
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
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    description: 'Convert text to the binary representation shown by the KillerTools Text to Binary tool.',
    inputSchema: { text: inputText },
  }, async ({ text }) => result({ binary: convertTextToAsciiBinary(text) }));

  server.registerTool('ascii_binary_to_text', {
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
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
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    description: 'Convert an integer from 1 to 3999 to a Roman numeral using the KillerTools converter.',
    inputSchema: { number: z.number().int().min(1).max(3999) },
  }, async ({ number }) => result({ roman: arabicToRoman(number) }));

  server.registerTool('roman_to_arabic', {
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    description: 'Convert a valid Roman numeral to an integer using the KillerTools converter.',
    inputSchema: { roman: z.string().min(1).max(32) },
  }, async ({ roman }) => {
    const number = romanToArabic(roman);
    return number === null
      ? { content: [{ type: 'text' as const, text: 'Invalid Roman numeral' }], isError: true }
      : result({ number });
  });

  server.registerTool('text_statistics', {
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    description: 'Count characters, words, lines, and UTF-8 bytes as shown by KillerTools Text Statistics.',
    inputSchema: { text: inputText },
  }, async ({ text }) => {
    const statistics = getTextStatistics(text);
    return result({ ...statistics, byteSizeDisplay: formatBytes(statistics.byteSize) });
  });

  server.registerTool('text_to_nato_alphabet', {
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    description: 'Convert text to NATO phonetic words using the KillerTools converter.',
    inputSchema: { text: inputText },
  }, async ({ text }) => result({ nato: textToNatoAlphabet({ text }).split(' ').filter(Boolean).join(' ') }));

  server.registerTool('convert_temperature', {
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
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
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
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
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    description: 'Convert an array of JSON objects to CSV using the KillerTools converter.',
    inputSchema: { rows: z.array(z.record(z.string(), z.unknown())).min(1).max(100) },
  }, async ({ rows }) => {
    const csv = convertArrayToCsv({ array: rows });
    return csv.length > 65536
      ? { content: [{ type: 'text' as const, text: 'CSV output is too large' }], isError: true }
      : result({ csv });
  });

  server.registerTool('generate_lorem_ipsum', {
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
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
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
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

const handler = createMcpHandler(() => createServer(), {
  route: '/',
  allowedHostnames: ['localhost', '127.0.0.1', 'mcp.killertools.net'],
  allowedOriginHostnames: ['localhost', '127.0.0.1', 'mcp.killertools.net'],
});

const directoryHandler = createMcpHandler(() => createServer('KillerMCP', true), {
  route: '/openai',
  allowedHostnames: ['localhost', '127.0.0.1', 'mcp.killertools.net'],
  allowedOriginHostnames: ['localhost', '127.0.0.1', 'mcp.killertools.net'],
});

// Same directory tool set for the Claude Connectors Directory listing.
const claudeHandler = createMcpHandler(() => createServer('KillerMCP', true), {
  route: '/claude',
  allowedHostnames: ['localhost', '127.0.0.1', 'mcp.killertools.net'],
  allowedOriginHostnames: ['localhost', '127.0.0.1', 'mcp.killertools.net'],
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const pathname = new URL(request.url).pathname;
    if (pathname === '/.well-known/openai-apps-challenge') {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
      }
      return new Response(request.method === 'HEAD' ? null : '07svdgvwAJD2mFJJ38Ccu5Y-zLdILittvnNduyqR10M', { headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
      } });
    }
    const page = pathname === '/privacy' ? privacyPage : pathname === '/terms' ? termsPage : undefined;
    if (page !== undefined) {
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
      }
      return new Response(request.method === 'HEAD' ? null : page, { headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src https://killertools.net; base-uri 'none'; frame-ancestors 'none'; form-action 'none'",
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      } });
    }
    if (pathname !== '/' && pathname !== '/openai' && pathname !== '/claude') {
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
    return (pathname === '/openai' ? directoryHandler : pathname === '/claude' ? claudeHandler : handler)(bounded, env, ctx);
  },
};
