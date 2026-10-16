import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';

const endpoint = process.env.MCP_URL || 'http://127.0.0.1:8792/openai';
const evidence = { endpoint, protocolChecks: [], positiveToolCalls: [], negativeClientCases: 'Not run: require an installed plugin in ChatGPT or Codex.' };
let nextId = 1;
async function request(method, params = {}, url = endpoint) {
  const id = nextId++;
  const response = await fetch(url, {
    method: 'POST',
    headers: { accept: 'application/json, text/event-stream', 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
    signal: AbortSignal.timeout(20000),
  });
  assert.equal(response.status, 200, `${method} HTTP status`);
  const body = await response.text();
  const data = body.split('\n').find(line => line.startsWith('data: '))?.slice(6) || body;
  const message = JSON.parse(data);
  assert.equal(message.id, id);
  assert.ok(!message.error, JSON.stringify(message.error));
  return message.result;
}
async function call(name, args) {
  return request('tools/call', { name, arguments: args });
}
async function positive(name, args, verify) {
  const result = await call(name, args);
  assert.notEqual(result.isError, true, name);
  const value = JSON.parse(result.content[0].text);
  verify(value);
  evidence.positiveToolCalls.push({ tool: name, arguments: args, output: value, passed: true });
}
const initialized = await request('initialize', { protocolVersion: '2025-11-25', capabilities: {}, clientInfo: { name: 'killermcp-directory-review', version: '0.1.0' } });
assert.equal(initialized.serverInfo.name, 'KillerMCP');
const listed = await request('tools/list');
assert.equal(listed.tools.length, 74);
assert.ok(listed.tools.some(tool => tool.name === 'generate_qr_code'));
const external = new Set(['lookup_cve', 'lookup_domain_dns', 'lookup_domain_rdap', 'search_gifs']);
for (const tool of listed.tools) {
  assert.equal(tool.annotations.readOnlyHint, true, tool.name);
  assert.equal(tool.annotations.destructiveHint, false, tool.name);
  assert.equal(tool.annotations.openWorldHint, external.has(tool.name), tool.name);
  assert.equal(tool.inputSchema.type, 'object', tool.name);
  assert.ok(tool.title && tool.annotations.title === tool.title, `${tool.name} title`);
}
evidence.protocolChecks.push('Directory exposes all 74 independent tools with explicit annotations.');
const original = await request('tools/list', {}, new URL('/', endpoint).href);
assert.equal(original.tools.length, 74);
assert.ok(original.tools.some(tool => tool.name === 'generate_qr_code'));
assert.ok(original.tools.every(tool => tool.title && tool.annotations?.title === tool.title), 'every root tool has a title');
assert.deepEqual(original.tools.map(tool => tool.name).sort(), listed.tools.map(tool => tool.name).sort());
evidence.protocolChecks.push('Every tool has a title, and the root and OpenAI routes expose the same 74 tools.');
await positive('calculate_ipv4_subnet', { address: '192.168.10.0/24' }, value => {
  assert.equal(value.networkAddress, '192.168.10.0');
  assert.equal(value.networkMask, '255.255.255.0');
  assert.equal(value.prefixLength, 24);
  assert.equal(value.usableHosts, 254);
});
await positive('lookup_windows_event', { query: '4625' }, value => assert.ok(value.some(event => event.id === 4625 && /failed|failure/i.test(JSON.stringify(event)))));
await positive('encode_base64', { text: 'KillerTools' }, value => assert.equal(value.encoded, 'S2lsbGVyVG9vbHM='));
await positive('format_json', { text: '{"z":2,"a":1}', indentSize: 2, sortKeys: true }, value => {
  assert.deepEqual(JSON.parse(value.text), { a: 1, z: 2 });
  assert.ok(value.text.indexOf('"a"') < value.text.indexOf('"z"'));
  assert.ok(value.text.includes('\n  "a"'));
});
await positive('build_powershell_command', { cmdlet: 'Get-Service', parameters: { Name: 'Spooler' } }, value => assert.equal(value.command, "Get-Service -Name 'Spooler'"));
for (const [name, args] of [['decode_base64', { encoded: '!invalid!' }], ['convert_case', { text: 'a'.repeat(4097) }], ['build_powershell_command', { cmdlet: 'Not-A-Cmdlet' }]]) {
  assert.equal((await call(name, args)).isError, true, name + ' invalid input');
}
evidence.protocolChecks.push('Invalid Base64, oversized text and unknown cmdlets return errors. These do not replace the negative client prompts.');
for (const [pathname, filename] of [['/privacy', 'privacy.html'], ['/terms', 'terms.html']]) {
  const url = new URL(pathname, endpoint);
  const response = await fetch(url);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
  assert.ok(response.headers.get('content-security-policy')?.includes("frame-ancestors 'none'"));
  const html = await response.text();
  const sourceHtml = response.headers.has('cf-ray')
    ? html.replace(/(<\/main>)<script>[^<]*window\.__CF\$cv\$params=[^<]*\/cdn-cgi\/challenge-platform\/scripts\/jsd\/main\.js[^<]*<\/script>(<\/body>)/, '$1$2')
    : html;
  assert.equal(sourceHtml, readFileSync(new URL('../legal/' + filename, import.meta.url), 'utf8'));
  assert.equal((await fetch(url, { method: 'HEAD' })).status, 200);
  assert.equal((await fetch(url, { method: 'POST' })).status, 405);
}
assert.equal((await fetch(new URL('/mcp', endpoint))).status, 404);
assert.equal((await fetch(new URL('/claude', endpoint))).status, 404);
evidence.protocolChecks.push('Legal pages match source after accounting for the Cloudflare JavaScript detection injection; HEAD works, POST is rejected, and unsupported /mcp remains 404.');
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(evidence, null, 2) + '\n');
console.log('Directory protocol, 74 annotations, matching routes, five positive calls, three input rejection checks and legal routes passed.');
console.log('Client prompt behavior and the reviewer video remain separate checks.');
