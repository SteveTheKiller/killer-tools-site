import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readFile, rmdir, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';

const child = spawn(process.execPath, ['local/server.mjs'], { cwd: new URL('..', import.meta.url), stdio: ['pipe', 'pipe', 'pipe'] });
let nextId = 1;
const pending = new Map();
let buffer = '';
let stderr = '';
child.stderr.on('data', chunk => stderr += chunk);
child.stdout.on('data', (chunk) => {
  buffer += chunk;
  while (buffer.includes('\n')) {
    const newline = buffer.indexOf('\n');
    const line = buffer.slice(0, newline);
    buffer = buffer.slice(newline + 1);
    if (!line.trim()) {
      continue;
    }
    const message = JSON.parse(line);
    const request = pending.get(message.id);
    if (request) {
      pending.delete(message.id);
      request(message);
    }
  }
});

function request(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`Timed out waiting for ${method}: ${stderr}`));
    }, 45000);
    pending.set(id, (response) => {
      clearTimeout(timeout);
      resolve(response);
    });
    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
  });
}

async function call(name, args) {
  const response = await request('tools/call', { name, arguments: args });
  assert.ok(response.result && !response.result.isError, JSON.stringify(response));
  return JSON.parse(response.result.content[0].text);
}

try {
  const initialized = await request('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'local-smoke', version: '0.1.0' },
  });
  assert.ok(initialized.result, JSON.stringify(initialized));
  child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' })}\n`);
  const listed = await request('tools/list');
  const names = new Set(listed.result.tools.map(tool => tool.name));
  const coverage = JSON.parse(await readFile(new URL('../coverage.json', import.meta.url), 'utf8'));
  const expected = [...Object.values(coverage).flat(), 'open_browser_companion_local'].sort();
  assert.deepEqual([...names].sort(), expected);
  for (const name of ['hash_text_private', 'hmac_private', 'crypt_text_private', 'bcrypt_private', 'bip39_private', 'parse_jwt_private', 'otp_private', 'generate_otp_secret_private', 'generate_password_private', 'analyze_password_private', 'generate_rsa_keypair_private', 'encode_file_base64_local', 'decode_file_base64_local', 'check_pdf_signatures_local', 'open_browser_companion_local', 'get_browser_device_information_local', 'get_browser_keycode_local', 'get_browser_html_local', 'get_browser_signature_local', 'get_browser_camera_local']) {
    assert.ok(names.has(name), name);
  }
  assert.equal((await call('hash_text_private', { value: 'abc' })).hash, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.ok(names.has('convert_case'));
  assert.ok((await call('convert_case', { text: 'Hello World' })).some(item => item.label === 'Lowercase' && item.value === 'hello world'));
  assert.equal((await request('tools/call', { name: 'convert_case', arguments: {} })).result.isError, true);
  assert.equal((await call('hmac_private', { value: 'abc', secret: 'key' })).hmac.length, 64);
  const encrypted = await call('crypt_text_private', { value: 'private', secret: 'key', action: 'encrypt' });
  assert.equal((await call('crypt_text_private', { value: encrypted.output, secret: 'key', action: 'decrypt' })).output, 'private');
  const bcrypt = await call('bcrypt_private', { value: 'private', action: 'hash', rounds: 4 });
  assert.equal((await call('bcrypt_private', { value: 'private', action: 'compare', hash: bcrypt.hash })).matches, true);
  const mnemonic = await call('bip39_private', { entropy: '00000000000000000000000000000000' });
  assert.equal(mnemonic.mnemonic.split(' ').length, 12);
  assert.equal((await call('bip39_private', { mnemonic: mnemonic.mnemonic })).entropy, mnemonic.entropy);
  const jwt = `eyJhbGciOiJub25lIn0.${Buffer.from('{"sub":"local"}').toString('base64url')}.x`;
  const parsedJwt = await call('parse_jwt_private', { token: jwt });
  assert.equal(parsedJwt.payload.sub, 'local');
  assert.equal(parsedJwt.payloadClaims.find(claim => claim.claim === 'sub').claimDescription, 'Subject');
  assert.equal(parsedJwt.signatureVerified, false);
  assert.equal((await call('otp_private', { secret: 'JBSWY3DPEHPK3PXP', mode: 'hotp', counter: 0 })).code.length, 6);
  assert.equal((await call('generate_otp_secret_private', { issuer: 'Test', account: 'User' })).secret.length, 16);
  assert.equal((await call('generate_password_private', { length: 24 })).password.length, 24);
  assert.equal((await call('generate_password_private', { mode: 'passphrase', wordCount: 4, capitalizeWords: false })).password.split('-').length, 4);
  const pronounceable = (await call('generate_password_private', { mode: 'pronounceable', length: 12 })).password;
  assert.equal(pronounceable.length, 12);
  assert.ok([...pronounceable].every((char, index) => (index % 2 === 0 ? 'bcdfghjkmnpqrstvwxz' : 'aeiouy').includes(char)));
  assert.match((await call('generate_password_private', { mode: 'format', format: 'hex', length: 24 })).password, /^[0-9a-f]{24}$/);
  assert.match((await call('generate_password_private', { mode: 'format', format: 'uuid' })).password, /^[0-9a-f-]{36}$/);
  const strength = await call('analyze_password_private', { password: 'Secret123!' });
  assert.equal(strength.charsetLength, 94);
  assert.ok(strength.entropy > 0 && strength.crackDurationFormatted);
  assert.ok((await call('generate_rsa_keypair_private', { bits: '2048' })).privateKeyPem.includes('BEGIN RSA PRIVATE KEY'));
  const directory = await mkdtemp(join(tmpdir(), 'kt-mcp-'));
  const original = join(directory, 'original.txt');
  const decoded = join(directory, 'decoded.txt');
  try {
    await writeFile(original, 'local file');
    const encoded = await call('encode_file_base64_local', { path: original });
    assert.equal((await call('decode_file_base64_local', { path: decoded, base64: encoded.base64 })).byteLength, 10);
    assert.equal(await readFile(decoded, 'utf8'), 'local file');
    const overwrite = await request('tools/call', { name: 'decode_file_base64_local', arguments: { path: decoded, base64: encoded.base64 } });
    assert.equal(overwrite.result.isError, true);
    assert.equal((await request('tools/call', { name: 'check_pdf_signatures_local', arguments: { path: original } })).result.isError, true);
  }
  finally {
    await unlink(original);
    await unlink(decoded);
    await rmdir(directory);
  }
  const browser = await call('open_browser_companion_local', {});
  const page = await fetch(browser.url);
  assert.equal(page.status, 200);
  assert.ok((await page.text()).includes('Camera recorder'));
  const untrusted = new URL(browser.url);
  untrusted.searchParams.set('token', 'wrong');
  assert.equal((await fetch(untrusted)).status, 403);
  const endpoint = new URL('/state', browser.url);
  endpoint.search = new URL(browser.url).search;
  for (const [type, name, value] of [
    ['device', 'get_browser_device_information_local', '{"userAgent":"test"}'],
    ['key', 'get_browser_keycode_local', '{"key":"A"}'],
    ['html', 'get_browser_html_local', '<p>test</p>'],
    ['signature', 'get_browser_signature_local', 'data:image/png;base64,dGVzdA=='],
    ['camera', 'get_browser_camera_local', 'data:image/png;base64,dGVzdA=='],
  ]) {
    assert.equal((await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': new URL(browser.url).origin },
      body: JSON.stringify({ type, value }),
    })).status, 204);
    assert.equal((await call(name, {})).value, value);
  }
  console.log('All 94 local MCP operations discovered; Worker forwarding, private operations, and browser transport passed.');
  if (process.env.MCP_BROWSER_PREVIEW === '1') {
    console.log(browser.url);
    await new Promise(resolve => setTimeout(resolve, 120000));
  }
}
finally {
  child.stdin.end();
  child.kill();
  await once(child, 'exit').catch(() => {});
}
