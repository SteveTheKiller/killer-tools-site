# KillerTools MCP tool inventory

The site registers 86 entries from `src/tools/index.ts`: 81 website tools and five links to desktop apps. The repository also has five unregistered tool directories. A website tool is not automatically an MCP operation. Each adapter needs a bounded input and output contract and a check against the page's behavior.

## Exposed locally

The public deployment exposes five MCP operations from `base64-string-converter`, `case-converter`, and `text-to-binary`. The local source has 74 operations across 64 website tools. The sixty-one additional website tools are `ascii-text-drawer`, `chmod-calculator`, `color-converter`, `crontab-generator`, `cve-lookup`, `date-time-converter`, `depth-of-field-calculator`, `dev-calculator`, `domain-lookup`, `email-header-parser`, `email-record-generator`, `emoji-picker`, `exchange-ndr-lookup`, `exposure-equivalence`, `gif-search`, `group-policy-reference`, `html-entities`, `http-status-codes`, `integer-base-converter`, `ipv4-range-expander`, `ipv4-subnet-calculator`, `ipv6-ula-generator`, `json-viewer`, `killer-modules`, `killer-scripts`, `json-converter`, `json-diff`, `json-minify`, `json-to-csv`, `lorem-ipsum-generator`, `m365-sku-decoder`, `mac-address-lookup`, `meta-tag-generator`, `markdown-to-html`, `math-evaluator`, `nd-filter-calculator`, `percentage-calculator`, `phone-parser-and-formatter`, `port-protocol-reference`, `powershell-builder`, `qr-code-generator`, `reciprocity-calculator`, `regex-tester`, `roman-numeral-converter`, `sql-prettify`, `svg-placeholder-generator`, `temperature-converter`, `text-diff`, `text-statistics`, `text-to-nato-alphabet`, `toml-converter`, `ulid-generator`, `url-parser`, `user-agent-parser`, `uuid-generator`, `windows-error-codes`, `windows-event-lookup`, `xml-formatter`, `xml-json-converter`, `yaml-converter`, and `yaml-viewer`.

## Unregistered directories

These directories are not listed on the live site's tool menu and are outside the 81-tool target: `basic-auth-generator`, `ipv4-address-converter`, `mime-types`, `service-tag-lookup`, `text-to-unicode`.

## Desktop product links

These are links to separate apps. They do not belong in the KillerTools website server: `killendar`, `killer-notes`, `killer-pdf`, `killer-scan`, `killer-shell`.

## Network or external data

The local source includes `cve-lookup`, `domain-lookup`, and `gif-search`. Their external services need availability and rate-limit review before public deployment. `mac-address-lookup` uses the site's bundled vendor data.

## Browser, device, file, or interactive surface

The local stdio server covers file conversion from `base64-file-converter` and signature inspection from `pdf-signature-checker`. Their inputs are local paths with size limits. A token-protected page on the user's own computer supplies the five browser interactions: `camera-recorder`, `device-information`, `html-wysiwyg-editor`, `keycode-info`, and `signature-creator`. The agent can retrieve the latest result after the user opens the page and interacts with it. Camera permission and actual capture still need a manual browser and hardware check.

## Credentials, secrets, or cryptographic material

The local stdio server covers `bcrypt`, `bip39-generator`, `encryption`, `hash-text`, `hmac-generator`, `jwt-parser`, `otp-code-generator-and-validator`, `password-generator`, `password-strength-analyser`, and `rsa-key-pair-generator`. It processes inputs on the user's machine. Do not expose these on the public endpoint until privacy and security behavior is designed per operation.

## Coverage and release status

Across the Worker and local stdio source, 94 MCP operations provide interfaces for all 81 website tools. [The coverage map](coverage.json) lists each website tool and its MCP operations, and `pnpm coverage` checks it against the site registry and server source. One operation opens the browser companion; the others process or retrieve tool results. The browser interactions require a live page and user action. The deployed public Worker still has only five operations, and the expanded local source has not been released.
