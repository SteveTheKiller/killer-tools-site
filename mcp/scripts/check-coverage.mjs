import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';

const root = new URL('../../', import.meta.url);
const mcp = new URL('../', import.meta.url);
const siteIndex = await readFile(new URL('src/tools/index.ts', root), 'utf8');
const coverage = JSON.parse(await readFile(new URL('coverage.json', mcp), 'utf8'));
const desktopLinks = new Set(['killendar', 'killer-notes', 'killer-pdf', 'killer-scan', 'killer-shell']);
const registered = [...siteIndex.matchAll(/^import \{ tool as [^}]+ \} from '\.\/([^']+)'/gm)].map(match => match[1]);
const websiteTools = registered.filter(slug => !desktopLinks.has(slug));

assert.equal(registered.length, 86, 'Website registration count changed');
assert.equal(new Set(registered).size, registered.length, 'Duplicate website registration');
assert.deepEqual(Object.keys(coverage).sort(), websiteTools.sort(), 'MCP coverage differs from the site tool registry');

const operationSources = [];
for (const filename of await readdir(new URL('src/', mcp))) {
  if (filename.endsWith('.ts')) {
    operationSources.push(await readFile(new URL(`src/${filename}`, mcp), 'utf8'));
  }
}
operationSources.push(await readFile(new URL('local/server.mjs', mcp), 'utf8'));
const companionSource = await readFile(new URL('local/browser-companion.mjs', mcp), 'utf8');
operationSources.push(companionSource);

const declared = operationSources.flatMap(source => [...source.matchAll(/registerTool\('([^']+)'/g)].map(match => match[1]));
declared.push(...[...companionSource.matchAll(/\['(get_browser_[^']+_local)',/g)].map(match => match[1]));
assert.equal(new Set(declared).size, declared.length, 'Duplicate MCP operation name');

const mapped = Object.values(coverage).flat();
assert.equal(new Set(mapped).size, mapped.length, 'One operation is mapped to multiple website tools');
assert.deepEqual(mapped.slice().sort(), declared.filter(name => name !== 'open_browser_companion_local').sort(), 'MCP coverage map does not match registered operations');
assert.equal(websiteTools.length, 81);
assert.equal(declared.length, 94);
console.log(`${websiteTools.length} website tools mapped to ${declared.length} MCP operations (including browser setup).`);
