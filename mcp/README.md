# KillerTools MCP

This Cloudflare Worker exposes selected website operations through MCP. Its source lives in this `mcp` directory, while the operations themselves stay in `src/tools` and `src/utils` for use by both the website and the server.

This server is for KillerTools website utilities. Desktop apps can have separate MCP servers in their own repositories. Links to those apps on the website do not expose their features through this endpoint.

## Local development

From the repository root, install the website dependencies with `pnpm install`. Then run `pnpm install` in this directory and `pnpm dev`. Connect an MCP client to `http://127.0.0.1:8787/mcp` (use the port printed by Wrangler).

Run `pnpm coverage` to compare every registered website tool with the [MCP operation map](coverage.json). With the local Worker running on port 8787, run `pnpm smoke` from this directory to verify MCP initialization, discovery, calls, validation, and concurrent requests. Set `MCP_URL` to test a different endpoint.

For access to all website tools on your machine, connect an MCP client entry to the local stdio server. It requires Node 24 or later and installed dependencies in both the website root and this directory. Use the Node executable as the command, with the absolute path to `local/server.mjs` as its argument. A package-manager script prints status text to standard output and cannot be used as the MCP stdio command. On startup, the stdio server launches a private Wrangler Worker on a random loopback port and discovers its 74 operations. It also registers local private and browser tools, for 94 operations in one connection. Run `node scripts/smoke-local.mjs` to test discovery and calls. Local tools handle secrets on the user's machine and read only files explicitly named in tool calls. Base64 decoding creates a new file and never overwrites an existing one. The client should ask before granting local file access.

### Connect from Codex on Windows

Install Node 24 or later and pnpm, then clone this repository. In PowerShell, run these commands from the repository root:

```powershell
pnpm install
Push-Location mcp
pnpm install
node scripts/smoke-local.mjs
Pop-Location
$nodePath = (Get-Command node).Source
$serverPath = (Resolve-Path .\mcp\local\server.mjs).Path
codex mcp add killertools_local -- $nodePath $serverPath
codex mcp get killertools_local
```

Open a new Codex chat after adding the server so it discovers the tools. The local server starts its private Worker when the client connects. For only the five currently public text operations, use `codex mcp add killertools --url https://mcp.killertools.net/mcp` instead. Other MCP clients can use the same local stdio command and argument, or the public streamable HTTP URL.

The stdio server also provides `open_browser_companion_local`. Open its private localhost URL in a browser to use camera capture, live device information, keycode events, HTML editing, and signature drawing. The browser page sends results only to that local MCP process. Camera access begins when the user clicks Enable camera. Browser interaction is required for these five tools, and real camera capture has not been verified on hardware yet.

The public deployment currently contains case conversion, Base64 string conversion, and text to ASCII binary conversion. The local Worker contains 74 operations across 64 website tools, including calculations, data conversion, network and reference lookup, catalog search, text processing, and formatting. The local stdio server exposes those operations along with the private and browser operations. All 81 website tools have a mapped interface. The full list is in [TOOL_INVENTORY.md](TOOL_INVENTORY.md). Public hosted calls send inputs to Cloudflare; the local Worker runs on the user's machine. Network lookup tools still contact their specified external sources. The website itself processes most operations in the browser.

The Worker accepts requests only at `/mcp`, rejects request bodies over 64 KiB, and uses a Cloudflare rate limit binding set to 120 requests per minute per connecting IP. Shared IP addresses share that limit, and Cloudflare's counters are local to each location and eventually consistent. Tool input schemas apply per-operation bounds. The current public version exposes bounded text utilities only. The local source also includes QR output that can encode Wi-Fi credentials. KillerScripts catalog lookup reads a fixed GitHub URL and caches the result in each Worker instance for ten minutes. Domain registration lookup uses the IANA RDAP bootstrap directory. Do not send secrets or private files to a hosted server without an access policy.

## Public deployment

The Worker is separate from the website's GitHub Pages workflow. Its first version is live at `https://mcp.killertools.net/mcp`. Before deploying a new version, confirm the signed-in Cloudflare account owns the active `killertools.net` zone and rate limit namespace `26092501` is not shared with another Worker.

Run `pnpm typecheck`, `pnpm smoke` against the local Worker, and `pnpm exec wrangler deploy --dry-run` before an authorized deployment. After deployment, run `pnpm smoke` with `MCP_URL=https://mcp.killertools.net/mcp` and check a second MCP client. Website connection instructions are pending publication.
