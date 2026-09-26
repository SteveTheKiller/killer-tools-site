# KillerTools MCP tool inventory

This is an initial routing inventory of the 91 directories under `src/tools`. A directory is a website feature, not automatically an MCP operation. Each proposed operation still needs an input and output contract, bounded execution, and a check that the Worker produces the same result as the page.

## Exposed locally

These three website tools currently account for five MCP operations: `base64-string-converter`, `case-converter`, `text-to-binary`.

## Desktop product links

These are links to separate apps. They do not belong in the KillerTools website server: `killendar`, `killer-notes`, `killer-pdf`, `killer-scan`, `killer-shell`.

## Network or external data

Review upstream access, freshness, costs, and rate limits before exposing: `cve-lookup`, `domain-lookup`, `gif-search`, `mac-address-lookup`, `service-tag-lookup`.

## Browser, device, file, or interactive surface

These need a different interface or a deliberate file and device policy: `base64-file-converter`, `camera-recorder`, `device-information`, `emoji-picker`, `html-wysiwyg-editor`, `keycode-info`, `pdf-signature-checker`, `signature-creator`.

## Credentials, secrets, or cryptographic material

Do not expose these on the public endpoint until privacy and security behavior is designed per operation: `basic-auth-generator`, `bcrypt`, `bip39-generator`, `encryption`, `hash-text`, `hmac-generator`, `jwt-parser`, `otp-code-generator-and-validator`, `password-generator`, `password-strength-analyser`, `rsa-key-pair-generator`.

## Local conversion, calculation, generation, and reference candidates

These have potential server-side use. This list is a candidate queue, not a claim that the current page logic is already portable or that every reference page should become a tool:

`ascii-text-drawer`, `chmod-calculator`, `color-converter`, `crontab-generator`, `date-time-converter`, `depth-of-field-calculator`, `dev-calculator`, `email-header-parser`, `email-record-generator`, `exchange-ndr-lookup`, `exposure-equivalence`, `group-policy-reference`, `html-entities`, `http-status-codes`, `integer-base-converter`, `ipv4-address-converter`, `ipv4-range-expander`, `ipv4-subnet-calculator`, `ipv6-ula-generator`, `json-converter`, `json-diff`, `json-minify`, `json-to-csv`, `json-viewer`, `killer-modules`, `killer-scripts`, `lorem-ipsum-generator`, `m365-sku-decoder`, `markdown-to-html`, `math-evaluator`, `meta-tag-generator`, `mime-types`, `nd-filter-calculator`, `percentage-calculator`, `phone-parser-and-formatter`, `port-protocol-reference`, `powershell-builder`, `qr-code-generator`, `reciprocity-calculator`, `regex-tester`, `roman-numeral-converter`, `sql-prettify`, `svg-placeholder-generator`, `temperature-converter`, `text-diff`, `text-statistics`, `text-to-nato-alphabet`, `text-to-unicode`, `toml-converter`, `ulid-generator`, `url-parser`, `user-agent-parser`, `uuid-generator`, `windows-error-codes`, `windows-event-lookup`, `xml-formatter`, `xml-json-converter`, `yaml-converter`, `yaml-viewer`.

The next batch should favor small, deterministic conversions with existing shared service or model functions. Reference pages need useful lookup inputs and bounded answers before they become MCP tools.
