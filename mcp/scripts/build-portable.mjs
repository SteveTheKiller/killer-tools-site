import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { copyFile, mkdir, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

if (process.platform !== 'win32' || process.arch !== 'x64' || !process.versions.node.startsWith('24.')) {
  throw new Error('Build the Windows x64 package with Node 24');
}

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist', 'portable');
const files = [
  { source: process.execPath, name: 'node.exe' },
  { source: join(root, 'dist', 'killermcp.mjs'), name: 'killermcp.mjs' },
];

async function sha256(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) {
    hash.update(chunk);
  }
  return hash.digest('hex');
}

await mkdir(output, { recursive: true });
const manifest = { nodeVersion: process.versions.node, platform: process.platform, arch: process.arch, files: {} };
for (const { source, name } of files) {
  const destination = join(output, name);
  const sourceSize = (await stat(source)).size;
  const sourceHash = await sha256(source);
  await copyFile(source, destination);
  const destinationSize = (await stat(destination)).size;
  const destinationHash = await sha256(destination);
  if (sourceSize !== destinationSize || sourceHash !== destinationHash) {
    throw new Error(`Package copy failed verification: ${name}`);
  }
  manifest.files[name] = { bytes: destinationSize, sha256: destinationHash };
}
await writeFile(join(output, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`KillerMCP portable runtime built at ${output}\n`);
