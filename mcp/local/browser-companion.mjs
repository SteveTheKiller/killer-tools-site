import { Buffer } from 'node:buffer';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';

const result = value => ({ content: [{ type: 'text', text: JSON.stringify(value) }] });
const error = message => ({ content: [{ type: 'text', text: message }], isError: true });
const token = randomBytes(24).toString('hex');
const page = new URL('./browser-companion.html', import.meta.url);
const limits = { device: 4096, key: 1024, html: 8192, signature: 1_000_000, camera: 2_000_000 };
const state = new Map();
let listenPort = 0;

function respond(response, status, body, contentType = 'text/plain; charset=utf-8') {
  response.writeHead(status, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(body);
}

async function accept(request, response) {
  const url = new URL(request.url, 'http://127.0.0.1');
  if (request.headers.host !== `127.0.0.1:${listenPort}` || url.searchParams.get('token') !== token) {
    respond(response, 403, 'Forbidden');
    return;
  }
  if (request.method === 'GET' && url.pathname === '/') {
    respond(response, 200, await readFile(page), 'text/html; charset=utf-8');
    return;
  }
  if (request.method !== 'POST' || url.pathname !== '/state'
    || request.headers.origin !== `http://127.0.0.1:${listenPort}`) {
    respond(response, 404, 'Not found');
    return;
  }
  const chunks = [];
  let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > 2_100_000) {
      respond(response, 413, 'Too large');
      return;
    }
    chunks.push(chunk);
  }
  try {
    const { type, value } = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!Object.hasOwn(limits, type) || typeof value !== 'string' || value.length > limits[type]) {
      respond(response, 400, 'Invalid state');
      return;
    }
    state.set(type, { value, updatedAt: Date.now() });
    respond(response, 204, '');
  }
  catch { respond(response, 400, 'Invalid JSON'); }
}

const listener = createServer((request, response) => {
  accept(request, response).catch(() => respond(response, 500, 'Unavailable'));
});

export function registerBrowserCompanion(server) {
  const ready = new Promise(resolve => listener.listen(0, '127.0.0.1', () => {
    listenPort = listener.address().port;
    resolve();
  }));
  server.registerTool('open_browser_companion_local', {
    description: 'Get the private local page to enable live browser, camera, editor, and signature tools.',
    inputSchema: {},
  }, async () => {
    await ready;
    return result({ url: `http://127.0.0.1:${listenPort}/?token=${token}` });
  });

  for (const [name, type, description] of [
    ['get_browser_device_information_local', 'device', 'Read live device and browser information from the local companion page.'],
    ['get_browser_keycode_local', 'key', 'Read the most recent keyboard event from the local companion page.'],
    ['get_browser_html_local', 'html', 'Read the current HTML editor content from the local companion page.'],
    ['get_browser_signature_local', 'signature', 'Read the drawn signature PNG from the local companion page.'],
    ['get_browser_camera_local', 'camera', 'Read the photo or video captured in the local companion page.'],
  ]) {
    server.registerTool(name, { description, inputSchema: {} }, async () => {
      const data = state.get(type);
      if (!data) {
        return error('Open the browser companion and provide this input first');
      }
      return result(data);
    });
  }
}
