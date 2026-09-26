# KillerTools MCP

This Cloudflare Worker exposes selected website operations through MCP. Its source lives in this `mcp` directory, while the operations themselves stay in `src/tools` and `src/utils` for use by both the website and the server.

This server is for KillerTools website utilities. Desktop apps can have separate MCP servers in their own repositories. Links to those apps on the website do not expose their features through this endpoint.

## Local development

From the repository root, install the website dependencies with `pnpm install`. Then run `pnpm install` in this directory and `pnpm dev`. Connect an MCP client to `http://127.0.0.1:8787/mcp` (use the port printed by Wrangler).

With the local Worker running on port 8787, run `pnpm smoke` from this directory to verify MCP initialization, discovery, calls, validation, and concurrent requests. Set `MCP_URL` to test a different endpoint.

The public deployment currently contains case conversion, Base64 string conversion, and text to ASCII binary conversion. The local source contains 74 operations across 64 website tools, including calculations, data conversion, network and reference lookup, catalog search, text processing, and formatting. The full list is in [TOOL_INVENTORY.md](TOOL_INVENTORY.md). Hosted calls send inputs to the server; the existing website processes them in the browser.

The Worker accepts requests only at `/mcp`, rejects request bodies over 64 KiB, and uses a Cloudflare rate limit binding set to 120 requests per minute per connecting IP. Shared IP addresses share that limit, and Cloudflare's counters are local to each location and eventually consistent. Tool input schemas apply per-operation bounds. The current public version exposes bounded text utilities only. The local source also includes QR output that can encode Wi-Fi credentials. KillerScripts catalog lookup reads a fixed GitHub URL and caches the result in each Worker instance for ten minutes. Domain registration lookup uses the IANA RDAP bootstrap directory. Do not send secrets or private files to a hosted server without an access policy.

## Public deployment

The Worker is separate from the website's GitHub Pages workflow. Its first version is live at `https://mcp.killertools.net/mcp`. Before deploying a new version, confirm the signed-in Cloudflare account owns the active `killertools.net` zone and rate limit namespace `26092501` is not shared with another Worker.

Run `pnpm typecheck`, `pnpm smoke` against the local Worker, and `pnpm exec wrangler deploy --dry-run` before an authorized deployment. After deployment, run `pnpm smoke` with `MCP_URL=https://mcp.killertools.net/mcp` and check a second MCP client. Website connection instructions are pending publication.
