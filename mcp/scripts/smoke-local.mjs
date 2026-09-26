import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
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
    }, 15000);
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
  for (const name of ['hash_text_private', 'hmac_private', 'crypt_text_private', 'bcrypt_private', 'bip39_private', 'parse_jwt_private', 'otp_private', 'generate_password_private', 'analyze_password_private', 'generate_rsa_keypair_private', 'encode_file_base64_local', 'check_pdf_signatures_local']) {
    assert.ok(names.has(name), name);
  }
  assert.equal((await call('hash_text_private', { value: 'abc' })).hash, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.equal((await call('hmac_private', { value: 'abc', secret: 'key' })).hmac.length, 64);
  const encrypted = await call('crypt_text_private', { value: 'private', secret: 'key', action: 'encrypt' });
  assert.equal((await call('crypt_text_private', { value: encrypted.output, secret: 'key', action: 'decrypt' })).output, 'private');
  const bcrypt = await call('bcrypt_private', { value: 'private', action: 'hash', rounds: 4 });
  assert.equal((await call('bcrypt_private', { value: 'private', action: 'compare', hash: bcrypt.hash })).matches, true);
  assert.equal((await call('bip39_private', { entropy: '00000000000000000000000000000000' })).mnemonic.split(' ').length, 12);
  const jwt = `eyJhbGciOiJub25lIn0.${Buffer.from('{"sub":"local"}').toString('base64url')}.x`;
  assert.equal((await call('parse_jwt_private', { token: jwt })).payload.sub, 'local');
  assert.equal((await call('otp_private', { secret: 'JBSWY3DPEHPK3PXP', mode: 'hotp', counter: 0 })).code.length, 6);
  assert.equal((await call('generate_password_private', { length: 24 })).password.length, 24);
  assert.ok((await call('analyze_password_private', { password: 'Secret123!' })).entropyBits > 0);
  assert.ok((await call('generate_rsa_keypair_private', { bits: '2048' })).privateKeyPem.includes('BEGIN RSA PRIVATE KEY'));
  console.log('Local MCP initialization, discovery, and private operation checks passed.');
}
finally {
  child.stdin.end();
  child.kill();
  await once(child, 'exit').catch(() => {});
}
