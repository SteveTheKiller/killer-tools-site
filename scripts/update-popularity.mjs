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

import { writeFileSync, mkdirSync, readFileSync, readdirSync } from 'fs';
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

// Renamed tools keep their history. Umami keys on the raw path, so a tool that changed URL
// restarts from zero and sinks to the bottom of the sidebar, taking the whole UMAMI_DAYS
// window to climb back to where it already was. The old path is folded into the new one.
//
// Both paths report during the overlap: the old one from visits still inside the look-back,
// the new one from visits since the rename. So the counts are ADDED, not assigned - an
// assignment would let whichever Umami returned last win and silently drop the other.
//
// Entries stay here once the window has passed. They cost one lookup, and they are the only
// record of why a number is the size it is.
const ALIAS = {
  '/killer-find': '/killer-shell',        // renamed 2026-07-27, KillerFind became KillerShell
  // Merged into Domain Lookup - see the comment on the import in src/tools/index.ts. Their
  // traffic is real and belongs to the tool that absorbed them, not in the bin.
  '/whois-checker': '/domain-lookup',
  '/email-dns-checker': '/domain-lookup',
};

// A tool's real age, where createdAt in its index.ts does not describe how long the URL has
// been COLLECTING traffic. Only needed when the two disagree.
//
// KillerShell is the case: ALIAS hands it every visit KillerFind ever had, but its createdAt is
// the 2026-07-27 rename. Rate-normalising on a three-day age would multiply inherited history
// by thirty and shoot it to the top of the site.
const SINCE = {
  '/killer-shell': '2026-04-01',   // KillerFind's era, which is where that traffic came from
};

// Below this, a tool is treated as this many days old however new it is. Without it a page that
// went up yesterday with four curious clicks outranks everything on the site.
const MIN_DAYS = 14;

// A floor on the ADJUSTED score, not a fake view count. A tool that launched today has no
// history at all, so nothing to normalise; this keeps it visible among its siblings until real
// traffic arrives. It stops mattering by itself the moment the measured rate passes it - no
// cleanup, no expiry to forget. Delete an entry once it is moot.
const SEED = {
  '/killendar': 85,   // launched 2026-07-30; sits just under KillerNotes' measured rate
};

/** Days each tool's page has been live, capped to the look-back window. */
function toolAges() {
  const dir = resolve(__dirname, '../src/tools');
  const ages = {};
  const now = Date.now();
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) { continue; }
    let src;
    try {
      src = readFileSync(resolve(dir, entry.name, 'index.ts'), 'utf8');
    } catch { continue; }
    const p = src.match(/path:\s*'([^']+)'/);
    if (!p) { continue; }
    const iso = SINCE[p[1]] ?? src.match(/createdAt:\s*new Date\('([\d-]+)'\)/)?.[1];
    // No createdAt means it predates the field, i.e. it is old - give it the full window.
    const lived = iso ? (now - Date.parse(iso)) / 86400000 : days;
    ages[p[1]] = Math.max(MIN_DAYS, Math.min(days, Math.round(lived)));
  }
  return ages;
}

// Only paths that are ACTUAL TOOLS survive. Umami records everything that ever hit the origin:
// 404 probes, scanner noise, `/fake.html`, absolute Windows and iOS file paths from people
// opening a downloaded copy of the site. None of it is ever looked up - Home.page.vue only
// resolves tool paths - so it is pure noise in a file that gets read by humans.
//
// The list is derived from the tool definitions themselves, so it cannot fall out of step.
// NOT from vite.config.ts dynamicRoutes: that list is missing ~30 real tools (/domain-lookup,
// /killer-pdf, /gif-search among them) despite its comment calling itself the single source of
// truth, so filtering on it would have silently deleted them.
function knownToolPaths() {
  const dir = resolve(__dirname, '../src/tools');
  const paths = new Set();
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) { continue; }
    let src;
    try {
      src = readFileSync(resolve(dir, entry.name, 'index.ts'), 'utf8');
    } catch { continue; }
    const m = src.match(/path:\s*'([^']+)'/);
    if (m) { paths.add(m[1]); }
  }
  return paths;
}

// Umami keys on the RAW path, so "/killer-scripts" and "/killer-scripts/" arrive as two
// separate rows for one tool. Home.page.vue looks the map up by the tool's canonical path,
// which never carries a trailing slash, so the slashed row was silently thrown away - and the
// tool sorted by only part of its traffic. On 2026-07-30 that was 71 tools and 1,652 views,
// with /killer-scripts losing 1,188 of its real 2,841.
//
// Normalise BEFORE the skip and the alias lookup, not after: "/about/" has to be recognised as
// "/about" to be skipped at all, and an aliased path could equally arrive slashed.
// Lowercased too: "/KILLER-SCRIPTS" is the same page as "/killer-scripts". Tool paths are all
// lowercase slugs, so folding case can never merge two genuinely different tools.
function normalise(path) {
  const trimmed = path.length > 1 ? path.replace(/\/+$/, '') : path;
  return trimmed.toLowerCase();
}

const KNOWN = knownToolPaths();
console.log(`Known tool paths: ${KNOWN.size}`);

const popularity = {};
let dropped = 0;
for (const { x: rawPath, y: views } of metrics) {
  if (!rawPath.startsWith('/')) { continue; }
  const path = normalise(rawPath);
  if (SKIP.has(path)) { continue; }
  const key = ALIAS[path] ?? path;
  if (!KNOWN.has(key)) { dropped++; continue; }
  // ADD, never assign - the whole point is that several raw rows fold into one tool.
  popularity[key] = (popularity[key] ?? 0) + views;
}
console.log(`Kept ${Object.keys(popularity).length} tool paths, dropped ${dropped} non-tool rows`);

// ── 4. Normalise for how long each page has existed ──────────────────────────
// Raw window totals rank a tool on how long it has been COLLECTING, not on how popular it is.
// KillerNotes went up 12 days into a 90-day window: in the last few days it drew the same
// traffic as KillerScan, but cumulatively it sat at 14 against Scan's 351 and landed near the
// bottom of the page. Every future tool would hit the same wall on the day it shipped.
//
// So the score is a RATE, scaled back up to window-equivalent so the numbers still read like
// pageviews: a tool that has been up the whole window is unchanged, and a newer one is judged
// on the days it actually had. MIN_DAYS damps the brand-new case.
const ages = toolAges();
for (const path of Object.keys(popularity)) {
  const lived = ages[path] ?? days;
  if (lived < days) {
    popularity[path] = Math.round(popularity[path] * days / lived);
  }
}

// Floors go on last, against the already-normalised score.
for (const [path, floor] of Object.entries(SEED)) {
  if (!KNOWN.has(path)) {
    console.warn(`SEED entry ${path} is not a tool path - remove it or fix the path`);
    continue;
  }
  if ((popularity[path] ?? 0) < floor) { popularity[path] = floor; }
}

// Sort descending by views for readability
const sorted = Object.fromEntries(
  Object.entries(popularity).sort(([, a], [, b]) => b - a),
);

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(sorted, null, 2) + '\n');
console.log(`Wrote ${Object.keys(sorted).length} entries to ${OUT}`);
