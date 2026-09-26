import assert from 'node:assert/strict';

const endpoint = process.env.MCP_URL || 'http://127.0.0.1:8787/mcp';
let nextId = 1;

async function request(method, params = {}) {
  const id = nextId++;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      accept: 'application/json, text/event-stream',
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
  'calculate_ipv4_subnet',
  'calculate_percentage',
  'convert_case',
  'convert_integer_base',
  'convert_json',
  'convert_temperature',
  'convert_toml',
  'convert_yaml',
  'decode_base64',
  'encode_base64',
  'expand_ipv4_range',
  'generate_lorem_ipsum',
  'json_to_csv',
  'lookup_exchange_ndr',
  'lookup_group_policy',
  'lookup_http_status',
  'lookup_m365_sku',
  'lookup_port_protocol',
  'lookup_windows_error',
  'lookup_windows_event',
  'minify_json',
  'parse_url',
  'roman_to_arabic',
  'text_statistics',
  'text_to_ascii_binary',
  'text_to_nato_alphabet',
]);

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
assert.equal(JSON.parse((await call('convert_yaml', { text: 'a: 1', to: 'json' })).content[0].text).text, '{\n  "a": 1\n}');
assert.equal(JSON.parse((await call('convert_toml', { text: 'a = 1', to: 'json' })).content[0].text).text, '{\n  "a": 1\n}');
assert.equal(JSON.parse((await call('minify_json', { text: '{ a: 1 }' })).content[0].text).text, '{"a":1}');
assert.equal((await call('convert_yaml', { text: 'a: [', to: 'json' })).isError, true);
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
assert.equal(JSON.parse((await call('json_to_csv', { rows: [{ name: 'Ada', age: 37 }] })).content[0].text).csv, 'name,age\nAda,37');
assert.equal(JSON.parse((await call('generate_lorem_ipsum', { paragraphCount: 1, sentencePerParagraph: 1, wordCount: 4 })).content[0].text).text, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
const urlParts = JSON.parse((await call('parse_url', { url: 'https://example.com:3000/path?x=1#top' })).content[0].text);
assert.equal(urlParts.hostname, 'example.com');
assert.equal(urlParts.port, '3000');
assert.deepEqual(urlParts.searchParams, [['x', '1']]);
assert.equal((await call('parse_url', { url: 'not a url' })).isError, true);
assert.equal(JSON.parse((await call('lookup_http_status', { query: '404' })).content[0].text)[0].code, 404);
assert.equal(JSON.parse((await call('lookup_windows_error', { query: 'ERROR_FILE_NOT_FOUND' })).content[0].text)[0].decimal, 2);
assert.equal(JSON.parse((await call('lookup_windows_event', { query: '4625' })).content[0].text)[0].id, 4625);
assert.ok(JSON.parse((await call('lookup_exchange_ndr', { query: '5.7.1' })).content[0].text).length > 0);
assert.ok(JSON.parse((await call('lookup_group_policy', { query: 'Minimum Password Length' })).content[0].text).length > 0);
assert.ok(JSON.parse((await call('lookup_m365_sku', { query: 'O365_BUSINESS_ESSENTIALS' })).content[0].text).length > 0);
assert.equal(JSON.parse((await call('lookup_port_protocol', { query: '443' })).content[0].text)[0].port, 443);
assert.equal((await call('lookup_http_status', { query: '404', limit: 0 })).isError, true);

const invalid = await call('decode_base64', { encoded: '!invalid!' });
assert.equal(invalid.isError, true);
const oversized = await call('convert_case', { text: 'a'.repeat(4097) });
assert.equal(oversized.isError, true);
const largest = await call('text_to_ascii_binary', { text: 'a'.repeat(4096) });
assert.ok(largest.content[0].text.length < 40000);

const wrongPath = new URL(endpoint);
wrongPath.pathname = '/not-mcp';
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

console.log('MCP initialization, discovery, calls, errors, limits, and concurrency passed.');
