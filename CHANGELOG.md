# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## Version 2026.05.08

### Features

- **cve-lookup**: alias table expanded to 540 entries covering named vulnerabilities from 2001-2026 — searches like "dirty frag", "copy fail", "log4shell", "eternalblue", "heartbleed", and "xz backdoor" now resolve directly to CVE IDs without hitting the API
- **cve-lookup**: bare number search — entering a partial CVE number like "43284" tries CVE-YYYY-NNNNN across the last four years in parallel
- **cve-lookup**: GitHub Advisory Database searched alongside NVD for keyword queries, catching named CVEs not indexed by NVD description text
- **cve-lookup**: NVD direct link added to every result card
- **cve-lookup**: CVSS metrics table redesigned as a right-aligned column on each card with color-coded values (red = high risk, orange = medium, green = low, gray = no impact)
- **cve-lookup**: Scope added to CVSS metrics table (CHANGED = red, UNCHANGED = gray)
- **cve-lookup**: CWE badges are now clickable links to cwe.mitre.org definitions
- **cve-lookup**: all dropdowns and Search button restyled to match terminal green theme (dark background, green border, monospace font, chevron animation, clearable filters)

### Bug fixes

- **cve-lookup**: fixed infinite "Searching..." hang caused by missing fetch timeouts — all requests now abort after 10-15s via `AbortSignal.timeout()`
- **cve-lookup**: `keywordExactMatch` added to NVD requests to prevent false positives from AND-matching unrelated words across descriptions

## Version 2026.05.05

### Features

- **ipv4-subnet-calculator**: interactive host range bar showing network, usable hosts, and broadcast segments with proportional widths
- **ipv4-subnet-calculator**: amber color for host bits in bitmap to visually distinguish network vs host portions
- **ipv4-subnet-calculator**: replaced pill tag header with glowing status dot for Private/Public IP indicator
- **ipv4-subnet-calculator**: container query responsive collapse for two-column subnet/address layout

### Refactoring

- **theme**: unified dark terminal theme across all tools — `#0a0a0c` background, `#0f0f11` header bar, `#1ea54c` green values
- **theme**: added global `kt-terminal.css` as single source of truth for terminal chrome styles
- **theme**: scoped `!important` overrides on all terminal components to defeat NaiveUI background injection
- **theme**: `background: transparent !important` added to all terminal row classes across the tool suite
- **email-header-parser**: bumped text opacity across labels, values, hop lines, and auth details for readability
- **color-converter**: bumped label, prompt, and copy icon opacity; fixed transparent row backgrounds
- **date-time-converter**: bumped label, prompt, and copy icon opacity; fixed transparent row backgrounds
- **password-strength-analyser**: updated terminal background from `rgba(0,0,0,0.3)` to `#0a0a0c` with proper row overrides

### Bug fixes

- **ipv4-subnet-calculator**: restored truncated file tail caused by previous batch script (missing `</style>` and slider thumb CSS)
- **ipv4-subnet-calculator**: switched `@media` to `@container` for two-column collapse so layout responds to panel width not viewport
- **ipv4-subnet-calculator**: host range bar labels decoupled from segment proportions so network/broadcast text never clips

## Version 2026.05.02

### Features

- **gif-search**: new tool — search and preview animated GIFs via Giphy proxy Cloudflare Worker
- **KillerFind**: new landing page with terminal hero, feature cards, download link, and SHA256 checksum

### Refactoring

- **terminal retheme**: unified dark panel aesthetic (`#0a0a0c` / `#1ea54c`) applied across 90+ tool components
- **terminal retheme**: replaced NaiveUI inputs, dropdowns, sliders, and toggles with native HTML elements and custom styled variants throughout the tool suite
- **chore**: removed stale killer-scripts README; cleaned up tracked junk files; tightened `.gitignore`

---

## Version 2026.05.01

### Features

- **noHeader flag**: suppress compact header bar on fullscreen embedded tools (e.g. KillerScan)

### Bug fixes

- **noHeader**: corrected v-else fallthrough causing header to render on all fullscreen tools
- **sidebar**: locked sidebar width to prevent feature grid reflow when categories expand

### Chores

- **deps**: upgrade to Vite 8 and vue-router 5; migrate breaking changes from figue and change-case

---

## Version 2026.04.30

### Features

- **dark mode**: set dark mode as site default
- **about page**: full redesign with updated copy and CSP documentation

### Refactoring

- **tool pruning**: removed 13 low-value tools, dropped 3 nav categories, renamed Converter to Conversion, reordered nav, revamped OTP generator layout
- **tool pruning**: removed list-converter; applied terminal green styling to 6 additional tools
- **light mode**: fixed gray palette and terminal block contrast so dark terminals remain readable in light mode
- **ascii-word-art**: serve figlet fonts locally instead of jsdelivr CDN

### Bug fixes

- **ascii-word-art**: drop jsdelivr CDN dependency to fix CSP violations
- **mobile**: fixed version badge nowrap on small screens; fixed mobile overflow on Killer pages

### Chores

- **deps**: phase 2 build stack upgrade to Vite 7, vitest 3, ESLint 9, UnoCSS 66
- **deps**: phase 1 bumps: Vue 3.5, naive-ui 2.44, marked 18, jwt-decode 4, date-fns 4, TypeScript 5.9, vue-tsc 2.2; fixed all breaking changes

---

## Version 2026.04.26

### Features

- **KillerFind**: add tool landing page with terminal hero, feature cards, download link, and SHA256

### Bug fixes

- **ascii-word-art**: debounce input to fix page freeze on long strings; rename tool for clarity

---

## Version 2026.04.24

### Features

- **KillerScan**: two-column hero layout for landing page; bump to v1.3.0
- **KillerPDF**: two-column hero layout; flatten and password-protect feature cards; bump to v1.2.0

---

## Version 2026.04.21

### Features

- **crontab-generator**: terminal output panel, pill toggles, compact cheatsheet layout
- **hash-text**: retheme output as terminal rows; widen layout; cap encoding selector width
- **exchange-ndr-lookup**: deduplicate 4 hybrid NDR variants; add 18 new error codes
- **powershell-builder**: add 44 cmdlets; fix quick reference layout jump; default panel to closed state
- **password-generator**: new tool; merge WiFi QR into QR generator tool

### Bug fixes

- **mime-types**: replace `mime-types` package with inline map; fix extension lookup bug
- **wysiwyg**: fix toolbar icon rendering and missing en locale keys
- **cve-lookup**: proxy NVD API through Cloudflare Worker to avoid browser CORS blocking

---

## Version 2026.04.16

### Features

- **KillerScan**: add dedicated tool page with terminal hero and chevron feature list; bump to v1.1.0 (drop .NET 8 dependency)
- **KillerPDF**: add dedicated tool page with terminal hero; bump to v1.1.0 (drop .NET 8 dependency)
- **KillerScan**: auto-sort discovered devices by IP address; bump to v1.1.2
- **KillerScan / KillerPDF**: switch download links to GitHub Releases

### Refactoring

- **KillerScan / KillerPDF**: rebel OSS hero copy; add source links; add oosmetrics badges

---

## Version 2026.04.13

### Features

- **SEO**: per-page canonical URLs, Open Graph tags, Twitter cards, JSON-LD schema markup
- **sitemap**: add all tool routes to sitemap for search engine indexing

### Bug fixes

- **killer-scripts**: defang script content to clear Google Safe Browsing flag

---

## Version 2026.04.08

### Features

- **KillerScan**: add tool landing page; fix sidebar icons

---

## Version 2026.04.06

### Features

- **domain-lookup**: merge WHOIS and Email DNS checker into single unified Domain Lookup tool
- **email-record-generator**: new tool generating SPF and DMARC records

### Bug fixes

- **mobile**: fix CVE lookup search bar wrapping; fix search field autofocus on mobile; shorten long placeholder text
- **mobile menu**: add slide and fade animations to sidebar open/close transitions

---

## Version 2026.04.05

### Features

- **GPO reference**: add 386 new group policies across 33 categories (total 623 policies)
- **privacy policy**: add standalone privacy policy page for GitHub Pages hosting
- **post-build**: add route generation step for GitHub Pages 200 responses

### Refactoring

- **killer-scripts**: add description banner explaining Copy Command and Download behavior
- **killer-scripts**: move `sync-m365skus.ps1` to `scripts/` to keep out of public dist
- **SEO**: update meta descriptions for all tools

### Bug fixes

- **sidebar**: fix categories requiring two clicks to toggle on first visit
- **sidebar**: fix mobile menu not closing on item tap
- **og:image**: fix banner.jpg reference for social sharing previews
- **plausible-tracker**: remove leftover upstream dependency

---

## Version 2026.04.03

### Features

- **domain migration**: move all references from it-tools to killertools.net
- **compact header**: apply compact header bar to all tools; uncap layout width on desktop; fix tool descriptions and nav order

### Refactoring

- **branding**: remove Twitter/X references; fix i18n locale config
- **DMARC checker**: fix false positive warnings on valid DMARC records

---

## Version 2026.04.02

### Features

- **PowerShell Builder**: launch new tool with cmdlet builder UI, quick reference panel, and full TS/lint cleanup
- **XML / JSON / YAML / TOML converters**: add four new format conversion tools with updated locales
- **email header parser**: expanded hop analysis, auth results, and routing detail

### Refactoring

- **killer-scripts**: fix copy command, fix IEX piping, fix script download links
- **nav**: fix sidebar menu item order

### Bug fixes

- **linting**: resolve hundreds of ESLint warnings across codebase

---

## Version 2026.04.01

### Features

- **WHOIS lookup**: new tool
- **email header parser**: new tool
- **port and protocol reference**: expand entries; add two-column layout for subnet calculator and MIME types

### Refactoring

- **regex tester**: various tweaks and UX improvements
- **email DNS checker**: miscellaneous fixes
- **GPO reference**: expand from 202 to 237 entries across 42 categories

---

## Version 2026.03.31

### Features

- **Windows tools suite**: new tools added: Windows Error Codes, NDR Lookup, Email DNS Checker, CVE Lookup, Port Reference
- **M365 SKU decoder**: new tool decoding Microsoft 365 license SKUs with full product names
- **GPO reference**: new tool with 202 group policy entries across 42 categories
- **password policy reference**: new tool
- **subnet calculator**: improvements to layout and field organization
- **M365 Maps link**: add link to M365 Maps from SKU Decoder page

### Bug fixes

- **WYSIWYG editor**: fix toolbar rendering issues
- **QR generator**: fix rendering bug
- **mobile**: fix layout, scrollbar, menu, and spacing issues across multiple views
- **branding**: update favicons, banner, and linting fixes

### Chores

- **CI**: remove Docker nightly release workflow

---

## Version 2026.03.29

### Features

- **initial fork**: fork from IT-Tools; initial Killer Tools build targeting killertools.net
- **killer-scripts page**: new page listing downloadable PowerShell scripts with names, descriptions, and copy-command cards loaded from `descriptions.json`
- **branding**: VT323 retro terminal font style for sidebar logo, icons, and banner image
- **sidebar**: widen sidebar, collapse all categories by default except Killer Scripts; Killer Scripts pinned to top
- **PWA**: update manifest and page titles to Killer Tools branding
- **custom 404**: add custom 404 page and client-side redirects

### Bug fixes

- **ASCII art**: fix figlet font path, switch to jsdelivr CDN, add graceful fallback for missing fonts; remove duplicate font entry
- **mobile menu**: fix toggle button hidden behind circle button override; fix logo click blocked by gradient overlay
- **sidebar**: fix collapsed menu template structure; fix logo positioning; hide circle toolbar buttons
- **deploy**: fix GitHub Actions deploy using pnpm; skip vue-tsc in CI; add CNAME
- **token generator**: fix layout wrapping on mobile

### Chores

- **IT-Tools workflows**: remove upstream CI workflows; clean build after cache purge

---

## Version 2024.10.22-7ca5933

### Features

- **new tool**: Regex Tester (and Cheatsheet) (#1030) (f5c4ab1)
- **new tool**: Markdown to HTML (#916) (87984e2)
- **new-tool**: add email normalizer (#1243) (318fb6e)
- **new tools**: JSON to XML and XML to JSON (#1231) (f1a5489)
- **lorem-ipsum**: add button to refresh text lorem-ipsum (#1213) (e1b4f9a)
- **base64**: Base64 enhancements (#905) (30144aa)

### Bug fixes

- **favorites**: store favorites regardless of languages (#1202) (7ca5933)
- **emoji-picker**: debounced search input (#1181) (76a19d2)
- **format-transformer**: set overflow for output area width (#787) (b430bae)
- **jwt-parser**: prevent UI overflow on small screen (#1095) (dd4b7e6)

### Refactoring

- **regex-tester**: better description (7251700)

### Chores

- **sponsors**: fern sponsor banners (#1314) (f962c41)
- **readme**: updated logos (#1294) (6709498)

### Documentation

- **author**: updated author links (#1316) (1c35ac3)

## Version 2024.05.13-a0bc346

### Features

- **i18n**: added German translation (#1038) (2c2fb21)
- **new tool**: Outlook Safelink Decoder (#911) (d3b32cc)
- **new tool**: ascii art generator (#886) (fe349ad)
- **i18n**: get locales on build (#880) (dc04615)
- **i18n**: added vi tools translations (#876) (079aa21)
- **i18n**: added zh tools translations (#874) (9c6b122)
- **i18n**: added missing locale files in tools (#863) (7f5fa00)
- **i18n**: added vietnamese language (#859) (1334bff)
- **i18n**: added spanish language (#854) (85b50bb)
- **i18n**: added portuguese language (#813) (c65ffb6)
- **i18n**: added ukrainian language (#827) (693f362)
- **new-tool**: yaml formater (#779) (fc06f01)
- **new-tool**: added unicode conversion utilities (#858) (c46207f)

### Bug fixes

- **language**: English language cleanup (#1036) (221ddfa)
- **url-encoder, validation**: typo in validation of url-encoder.vue #1024 (cb5b462)
- **integer base converter**: support bigint (#872) (9eac9cb)
- **bcrypt tool**: allow salt rounds up to 100 (#987) (23f82d9)

### Refactoring

- **lint**: removed extra semi (33e5294)
- **auto-imports**: regen auto imports (1242842)
- **home**: lightened tool cards (#882) (a07806c)
- **home**: removed n-grid to prevent layout shift (#881) (10e56b3)
- **i18n**: added locales per tool (#861) (95698cb)

### Chores

- **issues**: prevent empty issues (#1078) (a0bc346)
- **issues**: removed old issue templates (#1077) (5a7b0f9)
- **node**: upgraded node version in CI workflows (b59942a)
- **version**: release 2024.05.10-33e5294 (38d5687)
- **issues**: improved issues template (2852c30)
- **issues**: improved bug issue template (#1046) (a799234)

### Documentation

- **changelog**: update changelog for 2024.05.10-33e5294 (9dfd347)

## Version 2023.12.21-5ed3693

### Features

- **i18n**: improve chinese i18n (#757) (2e56641)
- **i18n**: add tooltip and favoriteButton i18n (#756) (a1037cf)
- **i18n**: add Chinese translation base (#718) (8f99eb6)
- **new tool**: pdf signature checker (#745) (4781920)
- **new tool**: numeronym generator (#729) (e07e2ae)

### Bug fixes

- **jwt-parser**: jwt claim array support (#799) (5ed3693)
- **camera-recorder**: stop camera on navigation (#782) (80e46c9)
- **doc**: updated create new tool command in readme (#762) (7a70dbb)
- **base64-file-converter**: fix downloading of index.html content without data preambula (#750) (043e4f0)
- **docker**: rollback armv7 in docker releases (#741) (205e360)
- **eta**: corrected example (#737) (821cbea)

### Refactoring

- **about, i18n**: improved i18n dx with markdown (#753) (bd3edcb)
- **token, i18n**: complete fr translation (#752) (de1ee69)
- **uuid generator**: uuid version picker (#751) (38586ca)
- **case converter**: no split on lowercase, uppercase and mocking case (#748) (ca43a25)
- **ui**: replaced legacy n-upload with c-file-upload (#747) (7fe47b3)
- **token**: added password in token generator keywords (#746) (16ffe6b)
- **bcrypt**: fix input label align (#721) (093ff31)

### Chores

- **deps**: switched from oui to oui-data for mac address lookup (#693) (0fe9a20)
- **deps**: update unocss monorepo to ^0.57.0 (#638) (2e396d8)
- **docker**: added armv7 plateform for docker releases (#722) (fe1de8c)

## Version 2023.11.02-7d94e11

### Features

- **i18n**: language selector (#710) (e86fd96)

### Bug fixes

- **dockerfile**: revert replacement of nginx image with non-privileged one (#716) (7d94e11)
- **encryption**: alert on decryption error (#711) (02b0d0d)

### Refactoring

- **math-evaluator**: improved description (e87f4b1)
- **math-evaluator**: improved search and UX (#713) (58de897)

## Version 2023.11.01-e164afb

### Features

- **command-palette**: clear prompt on palette close (#708) (d013696)
- **command-palette**: added about page in command palette (99b1eb9)
- **new tool**: random MAC address generator (#657) (cc3425d)
- **case-converter**: added mocking case (#705) (681f7bf)
- **date-converter**: added excel date time format (#704) (f5eb7a8)
- **i18n**: token generator (#688) (02e68d3)
- **i18n**: home page (#687) (00562ed)
- **i18n**: support for i18n in .ts files (#683) (ebb4ec4)
- **i18n**: tool card (#682) (84a4a64)
- **i18n**: about page (#680) (a2b53c2)
- **i18n**: 404 page (#679) (35563b8)
- **new tool**: text to ascii converter (#669) (b2ad4f7)
- **new tool**: ULID generator (#623) (5c4d775)
- **new tool**: add wifi qr code generator (#599) (0eedce6)
- **new tool**: iban validation and parser (#591) (3a63837)
- **new tool**: text diff and comparator (#588) (81bfe57)

### Bug fixes

- **deps**: fix issue on slugify (#593) (#673) (720201a)
- **deps**: update dependency monaco-editor to ^0.43.0 (#620) (e371ef7)
- **deps**: update dependency sql-formatter to v13 (#606) (c7d4562)

### Refactoring

- **ui**: better ui demo preview menu (#664) (015c673)
- **color-converter**: improved color-converter UX (#701) (abb8335)
- **docker**: improved docker config (#700) (020e9cb)
- **c-table**: added description on c-table for accessibility (b408df8)
- **ci**: reduced timeout in e2e (#666) (88b8818)
- **ui**: new c-table ui component (#665) (ee4c853)
- **ui**: removed n-page-header component in user-agent parser (#663) (cbf58fd)
- **ui**: removed n-p components in about page (#662) (a757a51)
- **ui**: switched naive tooltip components to custom ones (#661) (025f556)
- **spelling**: minor corrections to phrasing/spelling (#596) (8a30b6b)
- **i18n**: merge tools scoped locales with global ones (#612) (233d556)
- **c-key-value-list**: got rid of table for layout (#611) (7ab9204)
- **CI**: run e2e against built app and no longer vercel (#610) (18dd140)
- **bcrypt**: fix typo (#604) (e18bae1)

### Chores

- **deps**: clean unused dependencies (#709) (e164afb)
- **deps**: update docker/setup-qemu-action action to v3 (#627) (4365226)
- **deps**: update docker/setup-buildx-action action to v3 (#626) (57ecda1)
- **deps**: update docker/login-action action to v3 (#625) (d8d7a3b)
- **deps**: update docker/build-push-action action to v5 (#624) (d36b18f)
- **deps**: update dependency node to v18.18.2 (#674) (eea9f91)
- **deps**: update dependency node to v18.18.0 (#636) (2d2dffb)
- **deps**: update actions/checkout action to v4 (#613) (4972159)
- **deps**: update dependency unplugin-icons to ^0.17.0 (#609) (f035f48)
- **deps**: update dependency @intlify/unplugin-vue-i18n to ^0.13.0 (#597) (d1dff42)
- **deps**: update dependency @antfu/eslint-config to ^0.41.0 (#585) (a9cd91c)
- **deps**: update dependency typescript to ~5.2.0 (#587) (f3e14fc)

### Doc

- **readme**: added contributors list (#622) (557b304)
- **hosting**: added cloudron in the other hosting solutions section (#589) (06c3547)

## Version 2023.08.21-6f93cba

### Features

- **copy**: support legacy copy to clipboard for older browser (#581) (6f93cba)
- **new tool**: string obfuscator (#575) (c58d6e3)

### Bug fixes

- **deps**: update dependency sql-formatter to v12 (#520) (2bcb77a)

### Chores

- **deps**: switched to fucking typescript v5 (#501) (76b2761)
- **deps**: update dependency @antfu/eslint-config to ^0.40.0 (#552) (6ff9a01)
- **deps**: update dependency prettier to v3 (#564) (a2b9b15)
- **deps**: removed @typescript-eslint/parser (#563) (144f86e)
- **deps**: removed ts-pattern (#565) (0f1f659)

## Version 2023.08.16-9bd4ad4

### Features

- **Case Converter**: Add lowercase and uppercase (#534) (7b6232a)
- **new tool**: emoji picker (#551) (93f7cf0)
- **ui**: added c-select in the ui lib (#550) (dfa1ba8)
- **new-tool**: password strength analyzer (#502) (a9c7b89)
- **new-tool**: yaml to toml (e29b258)
- **new-tool**: json to toml (ea50a3f)
- **new-tool**: toml to yaml (746e5bd)
- **new-tool**: toml to json (c7d4f11)
- **command-palette**: random tool action (ec4c533)
- **config**: allow app to run in a subfolder via BASE_URL (#461) (6304595)
- **new-tool**: percentage calculator (#456) (b9406a4)
- **new-tool**: json to csv converter (69f0bd0)
- **new tool**: xml formatter (#457) (a6bbeae)
- **chmod-calculator**: added symbolic representation (#455) (f771e7a)
- **enhancement**: use system dark mode (#458) (cf7b1f0)
- **phone-parser**: searchable country code select (d2956b6)
- **new tool**: camera screenshot and recorder (34d8e5c)
- **base64-string-converter**: switch to encode and decode url safe base64 strings (#392) (0b20f1c)

### Bug fixes

- **deps**: update dependency uuid to v9 (#566) (5e12991)
- **deps**: update dependency mathjs to v11 (#519) (7924456)
- **deps**: update dependency @vueuse/router to v10 (#516) (ea0f27c)
- **copy**: prevent shorthand copy if source is present in useCopy (#559) (86e964a)
- **c-lib**: hide component library shortcut link in non-dev (#557) (56d74d0)
- **emoji picker**: fix copy button (#556) (e5d0ba7)
- **deps**: update dependency @vueuse/head to v1 (#515) (d12dd40)
- **deps**: update dependency country-code-lookup to ^0.1.0 (#493) (8c72e69)
- **deps**: update dependency @vueuse/head to ^0.9.0 (#492) (cec9dea)
- **i18n**: fallback for demo i18n (12d9e5d)
- **typos**: fixed more typos & uppercase JSON (#475) (9526ed8)
- **about**: typos and wording (#474) (7068610)
- **mime-types**: typos (#470) (c4cec9e)
- **sonar**: took down minor sonar warning (4cbd7ac)
- **readme**: typo (105b21b)
- **ipv4-range-expander**: calculate correct for ip addresses where the first octet is lower than 128 (#405) (8c92d56)
- **ipv4-converter**: removed readonly on input (7aed9c5)

### Refactoring

- **navbar**: consistent spacing in navbar buttons (#507) (30f88fc)
- **ui**: remove n-text (#506) (72c98a3)
- **ui**: replaced some n-input to c-input (#505) (05ea545)
- **json-viewer**: input monospace font (#485) (9125dcf)
- **search**: command palette design (#463) (bcb98b3)
- **c-input-text**: force usage of props with default (1e2a35b)
- **naming**: prevent auto import conflicts for git memo (45c2474)
- **imports**: removed unnecessary imports to vue (fe61f0f)
- **ui**: removed all n-space (4d2b037)
- **ui**: replaced some n-input with c-input-text (f7fc779)

### Chores

- **deps**: update dependency vitest to ^0.34.0 (#562) (9bd4ad4)
- **deps**: update dependency node to v18.17.1 (#560) (65a9474)
- **deps**: update dependency unocss to ^0.55.0 (#561) (85cc7a8)
- **deps**: update dependency @unocss/eslint-config to ^0.55.0 (#553) (4268e25)
- **deps**: update dependency @intlify/unplugin-vue-i18n to ^0.12.0 (#526) (d1c8880)
- **deps**: update docker/login-action action to v2 (#512) (99bc84c)
- **deps**: update dependency jsdom to v22 (#499) (cd5a503)
- **deps**: update dependency @vitejs/plugin-vue-jsx to v3 (#497) (1a60236)
- **deps**: update dependency @vitejs/plugin-vue to v4 (#496) (a249421)
- **deps**: update dependency vite-plugin-pwa to ^0.16.0 (#488) (6498c9b)
- **deps**: update dependency vite to v4 (#503) (f40d7ec)
- **ci**: e2e against vercel deployement (#518) (2e28c50)
- **e2e**: execute e2e against built app (#511) (cf382b5)
- **deps**: update github/codeql-action action to v2 (#513) (0152583)
- **deps**: update node.js to v18 (#514) (38cb61d)
- **deps**: switched from vite-plugin-md to vite-plugin-vue-markdown (#510) (354aed6)
- **deps**: update dependency workbox-window to v7 (#509) (6b8682f)
- **deps**: update dependency vite-svg-loader to v4 (#508) (9e8349d)
- **deps**: update dependency typescript to ~4.9.0 (#481) (f440507)
- **deps**: update dependency vue-tsc to ^0.40.0 (#490) (b0d9a3e)
- **deps**: updated unplugin-auto-import (#504) (5c3bebf)
- **deps**: removed start-server-and-test dependency (8df7cd0)
- **deps**: update dependency c8 to v8 (#498) (6bda2ca)
- **deps**: update dependency @types/jsdom to v21 (#495) (994a1c3)
- **deps**: update node.js to v16.20.1 (#491) (05edaf4)
- **deps**: update dependency vitest to ^0.32.0 (#489) (49eacea)
- **deps**: update actions/checkout action to v3 (#494) (3f7d469)
- **deps**: update dependency unplugin-vue-components to ^0.25.0 (#484) (5f21908)
- **deps**: update dependency unplugin-auto-import to ^0.16.0 (#483) (6cb0845)
- **deps**: update dependency unocss to ^0.53.0 (#482) (38710dc)
- **deps**: update dependency @unocss/eslint-config to ^0.53.0 (#478) (282cfc4)
- **deps**: added renovate.json (#477) (363c2e4)
- **i18n**: tool scoped locales (#471) (1b038c7)
- **wysiwyg-editor**: update tiptap dependencies (732da08)
- **i18n**: setup i18n plugin config (ebfb872)
- **config**: netlify deployment support (#443) (93799af)
- **ci**: shard e2e tests (962a6d6)
- **lint**: switched to a better lint config (33c9b66)

### Refacor

- **transformers**: use monospace font for JSON and SQL text areas (#476) (ba4876d)

### Documentation

- **ide**: updated vscode extensions settings (#472) (847323c)

### Chors

- **deps**: updated vueuse dependency version (8515c24)

## Version 2023.05.14-77f2efc

### Features

- **list-converter**: a small converter who deals with column based data and do some stuff with it (#387) (83a7b3b)
- **new tool**: phone parser and normalizer (ce3150c)

### Bug fixes

- **phone-parser**: use default country code (a43c546)
- **home**: prevent weird blue border on card (3f6c8f0)

### Refactoring

- **ui**: replaced some n-input with c-input-text (77f2efc)

### Chores

- **issues**: updated new tool request issue template (edae4c6)

### Ui-lib

- **new-component**: added text input component in the c-lib (aad8d84)
- **button**: size variants (401f13f)

## Version 2023.04.23-92bd835

### Features

- **ui-lib**: demo pages for c-lib components (92bd835)
- **new-tool**: diff of two json objects (362f2fa)
- **ipv4-range-expander**: expands a given IPv4 start and end address to a valid IPv4 subnet (#366) (df989e2)
- **date converter**: auto focus main input (6d22025)

### Bug fixes

- **ts**: cleaned legacy typechecking warning (e88c1d5)
- **mac-address-lookup**: added copy handler on button click (c311e38)

### Refactoring

- **ui-lib**: prevent c-button to shrink (61ece23)
- **ui**: replaced naive ui cards with custom ones (f080933)
- **clean**: removed unused lodash import (bb32513)
- **clean**: removed useless br tags (74073f5)
- **ui**: getting ride of naive ui buttons (c45bce3)

## Version 2023.04.14-dbad773

### Features

- **new-tool**: http status codes (8355bd2)

### Refactoring

- **uuid-generator**: prevent NaN in quantity (6fb4994)

### Chores

- **release**: create a github release on new version (dbad773)
- **version**: reset CHANGELOG content to support new format (85cb0ff)

## Version 2023.04.14-f9b77b7

### Features

- **new-tool**: http status codes (8355bd2)

### Refactoring

- **uuid-generator**: prevent NaN in quantity (6fb4994)

### Chores

- **release**: create a github release on new version (f9b77b7)
- **version**: reset CHANGELOG content to support new format (85cb0ff)

## Version 2023.04.14-2f0d239

### Features

- **new-tool**: http status codes (8355bd2)

### Refactoring

- **uuid-generator**: prevent NaN in quantity (6fb4994)

### Chores

- **release**: create a github release on new version (2f0d239)
- **version**: reset CHANGELOG content to support new format (85cb0ff)

## Version 2023.04.14-474cae4

### Features

- **new-tool**: http status codes (8355bd2)

### Refactoring

- **uuid-generator**: prevent NaN in quantity (6fb4994)

### Chores

- **release**: create a github release on new version (474cae4)
- **version**: reset CHANGELOG content to support new format (85cb0ff)

## Version v2023.4.13-dce9ff9

Diff not available
