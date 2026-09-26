import assert from 'node:assert/strict';
import process from 'node:process';

const endpoint = process.env.MCP_URL || 'http://127.0.0.1:8787/';
let nextId = 1;

async function request(method, params = {}) {
  const id = nextId++;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'accept': 'application/json, text/event-stream',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
  });
  assert.equal(response.status, 200, `${method} returned HTTP ${response.status}`);
  const body = await response.text();
  const data = body.startsWith('event: message\n')
    ? body.split('\n').find(line => line.startsWith('data: '))?.slice(6)
    : body;
  assert.ok(data, `${method} returned no message`);
  const message = JSON.parse(data);
  assert.equal(message.id, id);
  assert.equal(message.jsonrpc, '2.0');
  assert.ok(!message.error, `${method}: ${JSON.stringify(message.error)}`);
  return message.result;
}

const initialized = await request('initialize', {
  protocolVersion: '2025-11-25',
  capabilities: {},
  clientInfo: { name: 'killertools-smoke', version: '1' },
});
assert.equal(initialized.serverInfo.name, 'KillerTools MCP');

const listed = await request('tools/list');
assert.deepEqual(listed.tools.map(tool => tool.name).sort(), [
  'arabic_to_roman',
  'ascii_binary_to_text',
  'calculate_chmod',
  'calculate_depth_of_field',
  'calculate_exposure_equivalence',
  'calculate_film_development',
  'calculate_ipv4_subnet',
  'calculate_nd_exposure',
  'calculate_percentage',
  'calculate_reciprocity',
  'convert_case',
  'convert_date_time',
  'convert_color',
  'convert_integer_base',
  'convert_json',
  'convert_temperature',
  'convert_toml',
  'convert_xml_json',
  'convert_yaml',
  'decode_base64',
  'diff_json',
  'diff_text',
  'describe_cron',
  'draw_ascii_text',
  'encode_base64',
  'escape_html_entities',
  'evaluate_math',
  'expand_ipv4_range',
  'format_xml',
  'format_sql',
  'format_json',
  'format_yaml',
  'get_powershell_cmdlet',
  'generate_lorem_ipsum',
  'generate_svg_placeholder',
  'generate_ulids',
  'generate_ipv6_ula',
  'generate_spf_record',
  'generate_qr_code',
  'generate_meta_tags',
  'generate_dmarc_record',
  'generate_uuids',
  'json_to_csv',
  'list_film_stocks',
  'list_film_development_options',
  'list_killer_modules',
  'list_killer_scripts',
  'lookup_exchange_ndr',
  'lookup_cve',
  'lookup_domain_dns',
  'lookup_domain_rdap',
  'lookup_group_policy',
  'lookup_http_status',
  'lookup_m365_sku',
  'lookup_mac_vendor',
  'lookup_port_protocol',
  'lookup_windows_error',
  'lookup_windows_event',
  'markdown_to_html',
  'minify_json',
  'parse_url',
  'parse_phone_number',
  'parse_email_headers',
  'parse_user_agent',
  'roman_to_arabic',
  'search_emoji',
  'search_gifs',
  'search_powershell_cmdlets',
  'build_powershell_command',
  'text_statistics',
  'test_regex',
  'text_to_ascii_binary',
  'text_to_nato_alphabet',
  'unescape_html_entities',
].sort());

async function call(name, args) {
  return request('tools/call', { name, arguments: args });
}

const encoded = await call('encode_base64', { text: 'hello' });
assert.equal(JSON.parse(encoded.content[0].text).encoded, 'aGVsbG8=');
const decoded = await call('decode_base64', { encoded: 'aGVsbG8=' });
assert.equal(JSON.parse(decoded.content[0].text).text, 'hello');
const binary = await call('text_to_ascii_binary', { text: 'A' });
assert.equal(JSON.parse(binary.content[0].text).binary, '01000001');
const text = await call('ascii_binary_to_text', { binary: '01000001' });
assert.equal(JSON.parse(text.content[0].text).text, 'A');
const casing = await call('convert_case', { text: 'Hello World' });
assert.ok(JSON.parse(casing.content[0].text).some(item => item.label === 'Lowercase' && item.value === 'hello world'));
assert.equal(JSON.parse((await call('convert_integer_base', { value: 'ff', fromBase: 16, toBase: 10 })).content[0].text).value, '255');
assert.equal((await call('convert_integer_base', { value: 'fg', fromBase: 16, toBase: 10 })).isError, true);
const ipv4Range = JSON.parse((await call('expand_ipv4_range', { startIp: '192.168.1.1', endIp: '192.168.1.254' })).content[0].text);
assert.equal(ipv4Range.newCidr, '192.168.1.0/24');
assert.equal(ipv4Range.oldSize, 254);
assert.equal((await call('expand_ipv4_range', { startIp: '192.168.1.254', endIp: '192.168.1.1' })).isError, true);
const subnet = JSON.parse((await call('calculate_ipv4_subnet', { address: '192.168.1.42/24' })).content[0].text);
assert.equal(subnet.networkAddress, '192.168.1.0');
assert.equal(subnet.networkMask, '255.255.255.0');
assert.equal(subnet.usableHosts, 254);
assert.equal((await call('calculate_ipv4_subnet', { address: 'bad' })).isError, true);
assert.equal(JSON.parse((await call('convert_json', { text: '{ a: 1 }', to: 'yaml' })).content[0].text).text, 'a: 1\n');
assert.equal(JSON.parse((await call('format_json', { text: '{b:2,a:1}' })).content[0].text).text, '{\n   "a": 1,\n   "b": 2\n}');
assert.equal(JSON.parse((await call('format_yaml', { text: 'b: 2\na: 1', sortKeys: true })).content[0].text).text, 'a: 1\nb: 2\n');
assert.equal(JSON.parse((await call('convert_yaml', { text: 'a: 1', to: 'json' })).content[0].text).text, '{\n  "a": 1\n}');
assert.equal(JSON.parse((await call('convert_toml', { text: 'a = 1', to: 'json' })).content[0].text).text, '{\n  "a": 1\n}');
assert.equal(JSON.parse((await call('minify_json', { text: '{ a: 1 }' })).content[0].text).text, '{"a":1}');
assert.equal((await call('convert_yaml', { text: 'a: [', to: 'json' })).isError, true);
const chmod = JSON.parse((await call('calculate_chmod', { permissions: {
  owner: { read: true, write: true, execute: true },
  group: { read: true, write: false, execute: true },
  public: { read: true, write: false, execute: true },
} })).content[0].text);
assert.equal(chmod.octal, '755');
assert.equal(chmod.symbolic, 'rwxr-xr-x');
assert.equal(JSON.parse((await call('escape_html_entities', { text: '<a&>' })).content[0].text).text, '&lt;a&amp;&gt;');
assert.equal(JSON.parse((await call('unescape_html_entities', { text: '&lt;a&gt;' })).content[0].text).text, '<a>');
assert.match(JSON.parse((await call('generate_ulids', { count: 1 })).content[0].text).ids[0], /^[0-9A-HJKMNP-TV-Z]{26}$/);
assert.match(JSON.parse((await call('generate_uuids', { version: 'v4', count: 1 })).content[0].text).ids[0], /^[0-9a-f-]{36}$/);
assert.equal((await call('generate_uuids', { version: 'v5', namespace: 'bad' })).isError, true);
const jsonDiff = JSON.parse((await call('diff_json', { left: '{ a: 1 }', right: '{ a: 2 }' })).content[0].text);
assert.equal(jsonDiff.children[0].status, 'updated');
const textDiff = JSON.parse((await call('diff_text', { left: 'one\ntwo', right: 'one\nthree' })).content[0].text);
assert.equal(textDiff.added, 1);
assert.equal(textDiff.removed, 1);
assert.equal(JSON.parse((await call('format_xml', { text: '<a><b>text</b></a>' })).content[0].text).text.includes('<b>text</b>'), true);
assert.equal(JSON.parse((await call('convert_xml_json', { text: '<a x="1"/>', direction: 'xml_to_json' })).content[0].text).text.includes('"a"'), true);
assert.equal((await call('format_xml', { text: '<a><' })).isError, true);
assert.equal(JSON.parse((await call('calculate_nd_exposure', { baseSeconds: 0.008, stops: 10 })).content[0].text).seconds, 8.192);
assert.equal(JSON.parse((await call('calculate_exposure_equivalence', { shutterSeconds: 1, originalAperture: 8, targetAperture: 16 })).content[0].text).shutterSeconds, 4);
const depth = JSON.parse((await call('calculate_depth_of_field', { focalLengthMm: 50, aperture: 8, focusDistance: 15, focusUnit: 'ft', circleOfConfusionMm: 0.029 })).content[0].text);
assert.ok(depth.nearMeters > 0);
assert.ok(depth.hyperfocalMeters > depth.nearMeters);
assert.equal((await call('calculate_depth_of_field', { focalLengthMm: 200, aperture: 8, focusDistance: 0.1, focusUnit: 'm', circleOfConfusionMm: 0.029 })).isError, true);
assert.ok(JSON.parse((await call('list_film_stocks', {})).content[0].text).some(stock => stock.id === 'ilford-hp5'));
assert.ok(JSON.parse((await call('calculate_reciprocity', { filmStockId: 'ilford-hp5', meteredSeconds: 10 })).content[0].text).adjustedSeconds > 10);
assert.equal((await call('calculate_reciprocity', { filmStockId: 'unknown', meteredSeconds: 10 })).isError, true);
const color = JSON.parse((await call('convert_color', { color: '#ff0000' })).content[0].text);
assert.equal(color.hex, '#ff0000');
assert.equal(color.name.toLowerCase(), 'red');
assert.equal((await call('convert_color', { color: 'not a color' })).isError, true);
assert.ok(JSON.parse((await call('describe_cron', { expression: '40 * * * *' })).content[0].text).description.length > 0);
assert.equal((await call('describe_cron', { expression: 'bad cron' })).isError, true);
assert.equal(JSON.parse((await call('markdown_to_html', { markdown: '# Hello' })).content[0].text).text, '<h1>Hello</h1>\n');
assert.ok(JSON.parse((await call('format_sql', { sql: 'select a from t' })).content[0].text).text.includes('SELECT'));
const placeholder = JSON.parse((await call('generate_svg_placeholder', { width: 100, height: 50, customText: '<hello>' })).content[0].text);
assert.ok(placeholder.svg.includes('&lt;hello&gt;'));
assert.ok(placeholder.dataUrl.startsWith('data:image/svg+xml;base64,'));
const development = JSON.parse((await call('calculate_film_development', { filmName: 'Ilford HP5 Plus', developerId: 'd76' })).content[0].text);
assert.equal(development.baseSeconds, 390);
assert.equal(development.devMl, 500);
assert.ok(JSON.parse((await call('list_film_development_options', {})).content[0].text).developers.some(dev => dev.id === 'd76'));
assert.ok(JSON.parse((await call('list_killer_modules', {})).content[0].text).some(module => module.name === 'KillerPivot'));
assert.equal((await call('calculate_film_development', { filmName: 'unknown', developerId: 'd76' })).isError, true);
const phone = JSON.parse((await call('parse_phone_number', { phone: '+1 800 555 0199' })).content[0].text);
assert.equal(phone.e164, '+18005550199');
assert.equal((await call('parse_phone_number', { phone: 'bad' })).isError, true);
const date = JSON.parse((await call('convert_date_time', { value: '1700000000', inputFormat: 'unix_seconds' })).content[0].text);
assert.equal(date.timestampMs, '1700000000000');
assert.equal((await call('convert_date_time', { value: 'bad', inputFormat: 'mongo_object_id' })).isError, true);
const ula = JSON.parse((await call('generate_ipv6_ula', { macAddress: '20:37:06:12:34:56', timestampMs: 1700000000000 })).content[0].text);
assert.match(ula.ula48, /^fd[0-9a-f]{2}:[0-9a-f]{4}:[0-9a-f]{4}::\/48$/);
assert.equal((await call('generate_ipv6_ula', { macAddress: 'invalid' })).isError, true);
const spf = JSON.parse((await call('generate_spf_record', { providers: ['include:_spf.google.com'], ipAddresses: ['203.0.113.5'] })).content[0].text);
assert.equal(spf.record, 'v=spf1 include:_spf.google.com ip4:203.0.113.5 -all');
assert.equal((await call('generate_spf_record', { ipAddresses: ['bad'] })).isError, true);
const dmarc = JSON.parse((await call('generate_dmarc_record', { policy: 'quarantine', ruaEmails: ['reports@example.com'] })).content[0].text);
assert.equal(dmarc.record, 'v=DMARC1; p=quarantine; rua=mailto:reports@example.com');
const headers = JSON.parse((await call('parse_email_headers', { headers: 'From: Alice <alice@example.com>\nSubject: Test\nAuthentication-Results: mx.example.com; spf=pass smtp.mailfrom=example.com' })).content[0].text);
assert.equal(headers.fields.find(field => field.label === 'Subject').value, 'Test');
assert.equal(headers.auth[0].result, 'pass');
assert.ok(JSON.parse((await call('search_powershell_cmdlets', { query: 'Get-ADUser' })).content[0].text).some(item => item.cmdlet === 'Get-ADUser'));
assert.equal(JSON.parse((await call('get_powershell_cmdlet', { cmdlet: 'Get-ADUser' })).content[0].text).module, 'ActiveDirectory');
assert.equal(JSON.parse((await call('build_powershell_command', { cmdlet: 'Get-ADUser', parameters: { Identity: 'O\'Brien' } })).content[0].text).command, 'Get-ADUser -Identity \'O\'\'Brien\'');
assert.equal((await call('build_powershell_command', { cmdlet: 'Get-ADUser', parameters: { Unknown: 'value' } })).isError, true);
const qr = JSON.parse((await call('generate_qr_code', { mode: 'text', text: 'https://killertools.net' })).content[0].text);
assert.ok(qr.svg.startsWith('<svg'));
assert.equal((await call('generate_qr_code', { mode: 'wifi', wifi: { ssid: 'Example', password: 'secret', encryption: 'WPA' } })).isError, undefined);
const meta = JSON.parse((await call('generate_meta_tags', { fields: { title: 'KillerTools', url: 'https://killertools.net' } })).content[0].text);
assert.ok(meta.html.includes('KillerTools'));
assert.equal((await call('generate_meta_tags', { fields: { unknown: 'value' } })).isError, true);
assert.ok(JSON.parse((await call('search_emoji', { query: 'smile' })).content[0].text).some(item => item.emoji));
assert.equal(JSON.parse((await call('arabic_to_roman', { number: 42 })).content[0].text).roman, 'XLII');
assert.equal(JSON.parse((await call('roman_to_arabic', { roman: 'XLII' })).content[0].text).number, 42);
const temperatures = JSON.parse((await call('convert_temperature', { value: 0, scale: 'celsius' })).content[0].text);
assert.equal(temperatures.kelvin, 273.14);
assert.equal(temperatures.fahrenheit, 31.99);
assert.equal(temperatures.celsius, 0);
assert.equal((await call('roman_to_arabic', { roman: 'IIII' })).isError, true);
assert.equal((await call('arabic_to_roman', { number: 4000 })).isError, true);
const statistics = JSON.parse((await call('text_statistics', { text: 'A b\nC' })).content[0].text);
assert.deepEqual(statistics, { charCount: 5, wordCount: 3, lineCount: 2, byteSize: 5, byteSizeDisplay: '5 Bytes' });
assert.equal(JSON.parse((await call('text_to_nato_alphabet', { text: 'A B' })).content[0].text).nato, 'Alpha Bravo');
assert.equal(JSON.parse((await call('calculate_percentage', { mode: 'percent_of', x: 25, y: 80 })).content[0].text).value, '20');
assert.equal(JSON.parse((await call('calculate_percentage', { mode: 'what_percent', x: 20, y: 80 })).content[0].text).value, '25%');
assert.equal(JSON.parse((await call('calculate_percentage', { mode: 'change', x: 80, y: 100 })).content[0].text).value, '+25%');
assert.equal((await call('calculate_percentage', { mode: 'what_percent', x: 2, y: 0 })).isError, true);
assert.equal(JSON.parse((await call('evaluate_math', { expression: '2*sqrt(9)' })).content[0].text).value, 6);
assert.equal((await call('evaluate_math', { expression: '2^1000' })).isError, true);
assert.equal((await call('evaluate_math', { expression: 'import("x")' })).isError, true);
const regex = JSON.parse((await call('test_regex', { pattern: '(hello)', text: 'hello world' })).content[0].text);
assert.equal(regex.matches[0].match, 'hello');
assert.equal(regex.matches[0].groups[0], 'hello');
assert.equal((await call('test_regex', { pattern: '(a)\\1', text: 'aa' })).isError, true);
assert.equal(JSON.parse((await call('json_to_csv', { rows: [{ name: 'Ada', age: 37 }] })).content[0].text).csv, 'name,age\nAda,37');
assert.equal(JSON.parse((await call('generate_lorem_ipsum', { paragraphCount: 1, sentencePerParagraph: 1, wordCount: 4 })).content[0].text).text, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
const urlParts = JSON.parse((await call('parse_url', { url: 'https://example.com:3000/path?x=1#top' })).content[0].text);
assert.equal(urlParts.hostname, 'example.com');
assert.equal(urlParts.port, '3000');
assert.deepEqual(urlParts.searchParams, [['x', '1']]);
assert.equal((await call('parse_url', { url: 'not a url' })).isError, true);
const userAgent = JSON.parse((await call('parse_user_agent', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' })).content[0].text);
assert.equal(userAgent.browser.name, 'Chrome');
assert.equal(JSON.parse((await call('lookup_http_status', { query: '404' })).content[0].text)[0].code, 404);
assert.equal(JSON.parse((await call('lookup_windows_error', { query: 'ERROR_FILE_NOT_FOUND' })).content[0].text)[0].decimal, 2);
assert.equal(JSON.parse((await call('lookup_windows_event', { query: '4625' })).content[0].text)[0].id, 4625);
assert.ok(JSON.parse((await call('lookup_exchange_ndr', { query: '5.7.1' })).content[0].text).length > 0);
assert.ok(JSON.parse((await call('lookup_group_policy', { query: 'Minimum Password Length' })).content[0].text).length > 0);
assert.ok(JSON.parse((await call('lookup_m365_sku', { query: 'O365_BUSINESS_ESSENTIALS' })).content[0].text).length > 0);
assert.ok(JSON.parse((await call('lookup_mac_vendor', { macAddress: '20:37:06:12:34:56' })).content[0].text).details);
assert.equal(JSON.parse((await call('lookup_port_protocol', { query: '443' })).content[0].text)[0].port, 443);
assert.equal((await call('lookup_http_status', { query: '404', limit: 0 })).isError, true);

const invalid = await call('decode_base64', { encoded: '!invalid!' });
assert.equal(invalid.isError, true);
const oversized = await call('convert_case', { text: 'a'.repeat(4097) });
assert.equal(oversized.isError, true);
const largest = await call('text_to_ascii_binary', { text: 'a'.repeat(4096) });
assert.ok(largest.content[0].text.length < 40000);

const wrongPath = new URL(endpoint);
wrongPath.pathname = '/mcp';
assert.equal((await fetch(wrongPath)).status, 404);
assert.equal((await fetch(endpoint, {
  method: 'POST',
  body: 'a'.repeat(65537),
})).status, 413);
const chunkedBody = new ReadableStream({
  start(controller) {
    controller.enqueue(new TextEncoder().encode('a'.repeat(65537)));
    controller.close();
  },
});
assert.equal((await fetch(endpoint, {
  method: 'POST',
  body: chunkedBody,
  duplex: 'half',
})).status, 413);

const concurrent = await Promise.all(Array.from({ length: 8 }, (_, index) =>
  call('encode_base64', { text: `call-${index}` })));
assert.equal(new Set(concurrent.map(result => result.content[0].text)).size, 8);

if (process.env.MCP_LIVE_NETWORK === '1') {
  const scripts = JSON.parse((await call('list_killer_scripts', {})).content[0].text);
  assert.ok(scripts.some(script => script.filename === 'URT.ps1'));
  const art = JSON.parse((await call('draw_ascii_text', { text: 'Hi' })).content[0].text);
  assert.ok(art.art.length > 5 && art.art.includes('\n'));
  const gifs = JSON.parse((await call('search_gifs', { query: 'cat', limit: 2 })).content[0].text);
  assert.ok(gifs.length > 0 && gifs.length <= 2);
  const cve = JSON.parse((await call('lookup_cve', { query: 'CVE-2024-3094' })).content[0].text);
  assert.equal(cve.results[0].id, 'CVE-2024-3094');
  const dns = JSON.parse((await call('lookup_domain_dns', { name: 'example.com', type: 'A' })).content[0].text);
  assert.ok(dns.answers.some(answer => answer.data));
  const rdap = JSON.parse((await call('lookup_domain_rdap', { domain: 'example.com' })).content[0].text);
  assert.equal(rdap.domain.toLowerCase(), 'example.com');
}

console.log('MCP initialization, discovery, calls, errors, limits, and concurrency passed.');
