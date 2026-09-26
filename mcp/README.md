# KillerTools MCP

KillerTools MCP lets an MCP capable agent call the utilities from [KillerTools](https://killertools.net). The public Cloudflare Worker exposes 74 operations across 64 website tools. The optional local server exposes those operations plus 20 file, secret, and browser operations, covering all 81 active website tools. Each MCP tool supplies a description and bounded input schema to the agent when it connects. The [operation map](coverage.json) lists every website tool and its MCP operations.

This server is for KillerTools website utilities. Desktop apps can have separate MCP servers in their own repositories. Links to those apps on the website do not expose their features through this endpoint.

## Connect to the public server

Add this streamable HTTP endpoint to an MCP client:

```text
https://mcp.killertools.net
```

For Codex, run:

```powershell
codex mcp add killertools --url https://mcp.killertools.net
codex mcp get killertools
```

Open a new agent chat after adding the server so it discovers the tools. You can then ask naturally, for example, "Use KillerTools to calculate 192.168.10.0/24" or "Look up Windows event 4625 with KillerTools." The agent receives tool names, descriptions, and input schemas through MCP, so it does not need a separate prompt containing all 74 definitions. Ask for a specific operation when you want predictable behavior, such as `lookup_domain_rdap` for registration data or `lookup_domain_dns` for DNS records.

The public endpoint has no sign-in. Public tool inputs are sent to Cloudflare, and some lookup tools contact external data providers. Avoid sending passwords, private files, tokens, or client data to the public endpoint. Requests are limited to 64 KiB, and the Worker has a rate limit binding of 120 requests per minute per connecting IP. Shared IPs share that limit.

## Connect to the complete local server

For access to every website tool on your machine, connect an MCP client to the local stdio server. It requires Node 24 or later and installed dependencies in both the website root and this directory. Use the Node executable as the command, with the absolute path to `local/server.mjs` as its argument. A package-manager script prints status text to standard output and cannot be used as the MCP stdio command. On startup, the stdio server launches a private Wrangler Worker on a random loopback port. It exposes all 94 operations through one connection. Run `node scripts/smoke-local.mjs` to test discovery and calls.

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

Open a new Codex chat after adding the server so it discovers the tools. Other MCP clients can use the same local stdio command and argument. You can connect both servers, but their 74 shared operations may appear twice. Use `killertools_local` for the complete set, or the hosted connection when you do not want a local installation.

The stdio server also provides `open_browser_companion_local`. Open its private localhost URL in a browser to use camera capture, live device information, keycode events, HTML editing, and signature drawing. Interact with the page first, then ask the agent to retrieve the latest value with the matching `get_browser_*_local` tool. Its result includes an update timestamp. Camera access begins when the user clicks Enable camera. Real camera capture has not been verified on hardware yet.

The public Worker covers calculations, data conversion, network and reference lookup, catalog search, text processing, and formatting. The local server adds file, secret, and browser operations. The full split is in [TOOL_INVENTORY.md](TOOL_INVENTORY.md). The local tools run on the user's machine, but the MCP client and agent may still receive their inputs and outputs. Use the client's normal data handling rules for secrets. Local file tools read only the paths supplied in a tool call. Base64 decoding creates a new file and never overwrites an existing one. Review file paths before allowing an agent to use them.

The Worker accepts requests only at `/`, rejects request bodies over 64 KiB, and applies per-operation input bounds. Network and reference lookup results depend on their data sources being available. The local source also includes QR output that can encode Wi-Fi credentials. KillerScripts catalog lookup reads a fixed GitHub URL and caches the result in each Worker instance for ten minutes. Domain registration lookup uses the IANA RDAP bootstrap directory.

## Local development

From the repository root, install the website dependencies with `pnpm install`. Then run `pnpm install` in this directory and `pnpm dev`. Connect an MCP client to `http://127.0.0.1:8787/` (use the port printed by Wrangler).

Run `pnpm coverage` to compare every registered website tool with the [MCP operation map](coverage.json). With the local Worker running, run `pnpm smoke` from this directory to verify MCP initialization, discovery, calls, validation, and concurrent requests. Set `MCP_URL` to test a different endpoint.

## Public deployment

The Worker is separate from the website's GitHub Pages workflow. It is live at `https://mcp.killertools.net`. Before deploying a new version, confirm the signed-in Cloudflare account owns the active `killertools.net` zone and rate limit namespace `26092501` is not shared with another Worker.

Run `pnpm typecheck`, `pnpm smoke` against the local Worker, and `pnpm exec wrangler deploy --dry-run` before an authorized deployment. After deployment, run `pnpm smoke` with `MCP_URL=https://mcp.killertools.net` and check a second MCP client. The website connection page is still pending publication.
