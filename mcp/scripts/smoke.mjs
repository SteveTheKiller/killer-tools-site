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
  'ascii_binary_to_text',
  'convert_case',
  'decode_base64',
  'encode_base64',
  'text_to_ascii_binary',
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
