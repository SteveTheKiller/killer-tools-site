# KillerTools MCP tool inventory

The site registers 86 entries from `src/tools/index.ts`: 81 website tools and five links to desktop apps. All 81 website tools have an MCP interface. The [coverage map](coverage.json) gives the exact operation names, and `pnpm coverage` checks it against the site registry and server source.

## Public Worker

The deployed Worker exposes 74 operations across 64 website tools. These cover calculations, text and data conversion, network and reference lookup, catalog search, and formatting. Public operations include case conversion, Base64 text conversion, IP calculations, DNS and registration lookup, CVE lookup, email header parsing, QR generation, and PowerShell command building. Public tool inputs go to Cloudflare. External lookup tools can contact other services. Network results depend on provider availability and may change over time.

## Local server

The local stdio server includes all 74 Worker operations and 20 additional operations for the remaining 17 website tools and browser setup. It provides 94 operations in one connection. The local Worker runs on the user's computer. The MCP client and agent may still receive local tool inputs and outputs.

## Unregistered directories

These directories are not listed on the live site's tool menu and are outside the 81-tool target: `basic-auth-generator`, `ipv4-address-converter`, `mime-types`, `service-tag-lookup`, `text-to-unicode`.

## Desktop product links

These are links to separate apps. They do not belong in the KillerTools website server: `killendar`, `killer-notes`, `killer-pdf`, `killer-scan`, `killer-shell`.

## Network or external data

The public Worker includes `cve-lookup`, `domain-lookup`, and `gif-search`. Their external services can be unavailable or rate limited. `mac-address-lookup` uses the site's bundled vendor data.

## Browser, device, file, or interactive surface

The local stdio server covers file conversion from `base64-file-converter` and signature inspection from `pdf-signature-checker`. Their inputs are local paths with size limits. Base64 decoding creates a new file rather than overwriting an existing one. A token-protected page on the user's own computer supplies the five browser interactions: `camera-recorder`, `device-information`, `html-wysiwyg-editor`, `keycode-info`, and `signature-creator`. Call `open_browser_companion_local`, open its URL, provide input in the page, then call the matching `get_browser_*_local` operation. The result includes an update timestamp. Camera permission and actual capture still need a manual browser and hardware check.

## Credentials, secrets, or cryptographic material

The local stdio server covers `bcrypt`, `bip39-generator`, `encryption`, `hash-text`, `hmac-generator`, `jwt-parser`, `otp-code-generator-and-validator`, `password-generator`, `password-strength-analyser`, and `rsa-key-pair-generator`. It processes inputs on the user's machine, but the MCP client and agent may receive them. These operations are not on the public endpoint. `parse_jwt_private` decodes a token but does not verify its signature.

## Coverage and release status

Across the deployed Worker and local stdio server, 94 MCP operations provide interfaces for all 81 website tools. [The coverage map](coverage.json) lists each website tool and its MCP operations. One operation opens the browser companion; the others process or retrieve tool results. Browser interactions require a live page and user action.
