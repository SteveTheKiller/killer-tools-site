import type { QrCode, ReadRequest } from './reader.types';

interface Runtime {
  getConfig: () => { mainAssemblyName: string }
  getAssemblyExports: (name: string) => Promise<{ KillerTools: { Qr: { Browser: { Reader: { Read: (gray: string, width: number, height: number) => string } } } } }>
}

const worker = globalThis as unknown as {
  addEventListener: (type: 'message', listener: (event: MessageEvent<ReadRequest>) => void) => void
  postMessage: (value: { codes?: QrCode[], error?: boolean }) => void
};
let reader: Promise<(gray: string, width: number, height: number) => string> | undefined;

async function load(base: string) {
  const response = await fetch(new URL('manifest.json', base));
  if (!response.ok) {
    throw new Error('Cannot load the local QR runtime.');
  }
  const manifest = await response.json() as { bundle: string };
  if (!/^[a-f0-9]{64}$/.test(manifest.bundle)) {
    throw new Error('Invalid local QR runtime manifest.');
  }
  const url = new URL(`${manifest.bundle}/_framework/dotnet.js`, base).href;
  const module = await import(/* @vite-ignore */ url) as { dotnet: { create: () => Promise<Runtime> } };
  const runtime = await module.dotnet.create();
  const exports = await runtime.getAssemblyExports(runtime.getConfig().mainAssemblyName);
  return exports.KillerTools.Qr.Browser.Reader.Read;
}

// Keep onmessage unset during .NET startup so it can initialize as a standalone worker.
worker.addEventListener('message', async ({ data }) => {
  if (!(data?.gray instanceof ArrayBuffer)) {
    return;
  }
  try {
    reader ??= load(data.runtimeBase);
    const read = await reader;
    const bytes = new Uint8Array(data.gray);
    const chunks: string[] = [];
    for (let index = 0; index < bytes.length; index += 32768) {
      chunks.push(String.fromCharCode(...bytes.subarray(index, index + 32768)));
    }
    worker.postMessage({ codes: JSON.parse(read(btoa(chunks.join('')), data.width, data.height)) as QrCode[] });
  }
  catch {
    reader = undefined;
    worker.postMessage({ error: true });
  }
});
