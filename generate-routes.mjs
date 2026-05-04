/**
 * Post-build script: copies dist/index.html into each route's folder
 * so GitHub Pages returns 200 instead of 404 for direct URL access.
 *
 * Run after vite build: node generate-routes.mjs
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

// Parse routes from vite.config.ts (single source of truth)
const config = readFileSync('vite.config.ts', 'utf8');
const match = config.match(/dynamicRoutes:\s*\[([\s\S]*?)\]/);
if (!match) {
  console.error('Could not find dynamicRoutes in vite.config.ts');
  process.exit(1);
}

const routes = match[1].match(/'([^']+)'/g).map(r => r.replace(/'/g, ''));
const distDir = join(process.cwd(), 'dist');
const indexHtml = join(distDir, 'index.html');

if (!existsSync(indexHtml)) {
  console.error('dist/index.html not found. Run vite build first.');
  process.exit(1);
}

let created = 0;
for (const route of routes) {
  const routeDir = join(distDir, route.replace(/^\//, ''));
  const target = join(routeDir, 'index.html');
  if (!existsSync(target)) {
    mkdirSync(routeDir, { recursive: true });
    copyFileSync(indexHtml, target);
    created++;
  }
}

console.warn(`Route generation complete: ${created} routes created, ${routes.length - created} already existed.`);
