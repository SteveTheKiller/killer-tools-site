import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const directory = fileURLToPath(new URL('../', import.meta.url));
const wrangler = fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url));
let workerProcess;
let endpointPromise;
let nextId = 1;

function stopWorker() {
  workerProcess?.kill();
}

function startWorker() {
  if (!existsSync(wrangler)) {
    throw new Error('Install MCP dependencies before starting the local Worker');
  }
  workerProcess = spawn(process.execPath, [wrangler, 'dev', '--local', '--port', '0', '--ip', '127.0.0.1'], {
    cwd: directory,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  process.once('exit', stopWorker);
  process.stdin.once('end', stopWorker);
  return new Promise((resolve, reject) => {
    let output = '';
    const timeout = setTimeout(() => fail(new Error('Local Worker startup timed out')), 30000);
    function fail(cause) {
      clearTimeout(timeout);
      stopWorker();
      reject(cause);
    }
    function inspect(chunk) {
      output = (output + chunk.toString()).slice(-8192);
      const match = output.match(/http:\/\/127\.0\.0\.1:(\d+)/);
      if (match) {
        clearTimeout(timeout);
        resolve(`http://127.0.0.1:${match[1]}/`);
      }
    }
    workerProcess.stdout.on('data', inspect);
    workerProcess.stderr.on('data', inspect);
    workerProcess.once('error', fail);
    workerProcess.once('exit', code => fail(new Error(`Local Worker stopped during startup (${code})`)));
  });
}

async function request(endpoint, method, params = {}) {
  const id = nextId++;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'accept': 'application/json, text/event-stream', 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    throw new Error(`Local Worker returned HTTP ${response.status}`);
  }
  const body = await response.text();
  if (body.length > 1_000_000) {
    throw new Error('Local Worker response exceeds limit');
  }
  const data = body.startsWith('event: message\n')
    ? body.split('\n').find(line => line.startsWith('data: '))?.slice(6)
    : body;
  const message = JSON.parse(data);
  if (message.id !== id || message.error) {
    throw new Error(`Local Worker ${method} failed: ${JSON.stringify(message.error)}`);
  }
  return message.result;
}

export async function registerLocalWorkerTools(server) {
  endpointPromise ??= startWorker();
  const endpoint = await endpointPromise;
  await request(endpoint, 'initialize', {
    protocolVersion: '2025-11-25',
    capabilities: {},
    clientInfo: { name: 'killertools-local-bridge', version: '1' },
  });
  const { tools } = await request(endpoint, 'tools/list');
  if (tools.length !== 74) {
    throw new Error(`Expected 74 local Worker tools, received ${tools.length}`);
  }
  for (const tool of tools) {
    const inputSchema = Object.fromEntries(Object.entries(tool.inputSchema.properties ?? {}).map(([name, schema]) => [
      name,
      z.fromJSONSchema(schema)[tool.inputSchema.required?.includes(name) ? 'nonoptional' : 'optional'](),
    ]));
    server.registerTool(tool.name, { description: tool.description, inputSchema }, async (args) => {
      try {
        return await request(endpoint, 'tools/call', { name: tool.name, arguments: args });
      }
      catch {
        return { content: [{ type: 'text', text: 'Local Worker call failed' }], isError: true };
      }
    });
  }
}
