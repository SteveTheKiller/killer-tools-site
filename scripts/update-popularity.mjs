#!/usr/bin/env node
/**
 * Fetch pageview counts from Umami and write src/data/tool-popularity.json.
 *
 * Required env vars:
 *   UMAMI_URL      — base URL of your Umami instance, e.g. https://analytics.killertools.net
 *   UMAMI_WEBSITE  — website UUID from Umami Settings → Websites
 *   UMAMI_USER     — Umami username
 *   UMAMI_PASS     — Umami password
 *
 * Optional:
 *   UMAMI_DAYS     — look-back window in days (default: 90)
 *
 * Usage:
 *   node scripts/update-popularity.mjs
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../src/data/tool-popularity.json');

const {
  UMAMI_URL,
  UMAMI_WEBSITE,
  UMAMI_USER,
  UMAMI_PASS,
  UMAMI_DAYS = '90',
} = process.env;

if (!UMAMI_URL || !UMAMI_WEBSITE || !UMAMI_USER || !UMAMI_PASS) {
  console.error('Missing required env vars: UMAMI_URL, UMAMI_WEBSITE, UMAMI_USER, UMAMI_PASS');
  process.exit(1);
}

const base = UMAMI_URL.replace(/\/$/, '');
const days = Number(UMAMI_DAYS);

console.log(`Authenticating as ${UMAMI_USER} at ${base}/api/auth/login`);

// ── 1. Authenticate ──────────────────────────────────────────────────────────
const authRes = await fetch(`${base}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: UMAMI_USER, password: UMAMI_PASS }),
});
if (!authRes.ok) {
  const body = await authRes.text();
  console.error(`Auth failed: ${authRes.status} ${authRes.statusText}`);
  console.error(`Response body: ${body}`);
  process.exit(1);
}
const { token } = await authRes.json();

// ── 2. Fetch page metrics ────────────────────────────────────────────────────
const endAt = Date.now();
const startAt = endAt - days * 24 * 60 * 60 * 1000;

const params = new URLSearchParams({
  startAt: String(startAt),
  endAt: String(endAt),
  type: 'path',
  limit: '500',
  offset: '0',
});

const metricsUrl = `${base}/api/websites/${UMAMI_WEBSITE}/metrics?${params}`;
console.log(`Fetching metrics from: ${metricsUrl}`);
const metricsRes = await fetch(
  metricsUrl,
  { headers: { Authorization: `Bearer ${token}` } },
);
const metricsBody = await metricsRes.text();
console.log(`Metrics response ${metricsRes.status}: ${metricsBody.slice(0, 500)}`);
if (!metricsRes.ok) {
  process.exit(1);
}

const metrics = JSON.parse(metricsBody);

// ── 3. Build path → pageview map ─────────────────────────────────────────────
// Umami returns [{ x: '/path', y: pageviewCount }, ...]
// Skip root "/" and "/about" — those aren't tool cards.
const SKIP = new Set(['/', '/about']);

const popularity = {};
for (const { x: path, y: views } of metrics) {
  if (SKIP.has(path)) { continue; }
  if (!path.startsWith('/')) { continue; }
  popularity[path] = views;
}

// Sort descending by views for readability
const sorted = Object.fromEntries(
  Object.entries(popularity).sort(([, a], [, b]) => b - a),
);

writeFileSync(OUT, JSON.stringify(sorted, null, 2) + '\n');
console.log(`Wrote ${Object.keys(sorted).length} entries to ${OUT}`);
