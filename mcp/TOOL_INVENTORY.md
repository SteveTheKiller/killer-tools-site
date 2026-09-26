# KillerTools MCP tool inventory

The site registers 86 entries from `src/tools/index.ts`: 81 website tools and five links to desktop apps. The repository also has five unregistered tool directories. A website tool is not automatically an MCP operation. Each adapter needs a bounded input and output contract and a check against the page's behavior.

## Exposed locally

The public deployment exposes five MCP operations from `base64-string-converter`, `case-converter`, and `text-to-binary`. The local source has 44 operations across 39 website tools. The thirty-six additional website tools are `chmod-calculator`, `color-converter`, `crontab-generator`, `depth-of-field-calculator`, `exchange-ndr-lookup`, `exposure-equivalence`, `group-policy-reference`, `html-entities`, `http-status-codes`, `integer-base-converter`, `ipv4-range-expander`, `ipv4-subnet-calculator`, `json-converter`, `json-diff`, `json-minify`, `json-to-csv`, `lorem-ipsum-generator`, `m365-sku-decoder`, `nd-filter-calculator`, `percentage-calculator`, `port-protocol-reference`, `reciprocity-calculator`, `roman-numeral-converter`, `temperature-converter`, `text-statistics`, `text-to-nato-alphabet`, `toml-converter`, `ulid-generator`, `url-parser`, `user-agent-parser`, `uuid-generator`, `windows-error-codes`, `windows-event-lookup`, `xml-formatter`, `xml-json-converter`, and `yaml-converter`.

## Unregistered directories

These directories are not listed on the live site's tool menu and are outside the 81-tool target: `basic-auth-generator`, `ipv4-address-converter`, `mime-types`, `service-tag-lookup`, `text-to-unicode`.

## Desktop product links

These are links to separate apps. They do not belong in the KillerTools website server: `killendar`, `killer-notes`, `killer-pdf`, `killer-scan`, `killer-shell`.

## Network or external data

Review upstream access, freshness, costs, and rate limits before exposing: `cve-lookup`, `domain-lookup`, `gif-search`, `mac-address-lookup`.

## Browser, device, file, or interactive surface

These need a different interface or a deliberate file and device policy: `base64-file-converter`, `camera-recorder`, `device-information`, `emoji-picker`, `html-wysiwyg-editor`, `keycode-info`, `pdf-signature-checker`, `signature-creator`.

## Credentials, secrets, or cryptographic material

Do not expose these on the public endpoint until privacy and security behavior is designed per operation: `bcrypt`, `bip39-generator`, `encryption`, `hash-text`, `hmac-generator`, `jwt-parser`, `otp-code-generator-and-validator`, `password-generator`, `password-strength-analyser`, `rsa-key-pair-generator`.

## Local conversion, calculation, generation, and reference candidates

These have potential server-side use. This list is a candidate queue, not a claim that the current page logic is already portable or that every reference page should become a tool:

`ascii-text-drawer`, `date-time-converter`, `dev-calculator`, `email-header-parser`, `email-record-generator`, `ipv6-ula-generator`, `json-viewer`, `killer-modules`, `killer-scripts`, `markdown-to-html`, `math-evaluator`, `meta-tag-generator`, `phone-parser-and-formatter`, `powershell-builder`, `qr-code-generator`, `regex-tester`, `sql-prettify`, `svg-placeholder-generator`, `text-diff`, `yaml-viewer`.

The next batch should favor small, deterministic conversions with existing shared service or model functions. Reference pages need useful lookup inputs and bounded answers before they become MCP tools.
