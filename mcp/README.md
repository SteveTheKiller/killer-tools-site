# KillerTools MCP

This Cloudflare Worker exposes selected website operations through MCP. Its source lives in this `mcp` directory, while the operations themselves stay in `src/tools` and `src/utils` for use by both the website and the server.

This server is for KillerTools website utilities. Desktop apps can have separate MCP servers in their own repositories. Links to those apps on the website do not expose their features through this endpoint.

## Local development

From the repository root, install the website dependencies with `pnpm install`. Then run `pnpm install` in this directory and `pnpm dev`. Connect an MCP client to `http://127.0.0.1:8787/mcp` (use the port printed by Wrangler).

With the local Worker running on port 8787, run `pnpm smoke` from this directory to verify MCP initialization, discovery, calls, validation, and concurrent requests. Set `MCP_URL` to test a different endpoint.

The first set contains case conversion, Base64 string conversion, and text to ASCII binary conversion. Input strings are limited to 4096 characters. Calls to a hosted version send those strings to the server. The existing website processes these inputs in the browser.

The Worker accepts requests only at `/mcp`, rejects request bodies over 64 KiB, and uses a Cloudflare rate limit binding set to 120 requests per minute per connecting IP. Shared IP addresses share that limit, and Cloudflare's counters are local to each location and eventually consistent. Tool input schemas independently cap strings at 4096 characters. Only bounded text utilities are exposed. Do not send secrets or private files to a hosted server.

## Public deployment

The Worker is separate from the website's GitHub Pages workflow. Before publishing, sign in with `pnpm exec wrangler login`. Confirm the signed-in account owns the active `killertools.net` Cloudflare zone, `mcp.killertools.net` has no conflicting DNS record, and rate limit namespace `26092501` is not shared with another Worker. The `wrangler.jsonc` custom domain setting will have Cloudflare create the DNS record and certificate when this Worker is deployed.

Run `pnpm typecheck`, `pnpm smoke` against the local Worker, and `pnpm exec wrangler deploy --dry-run` before an authorized deployment. Then deploy the Worker from this directory, run `pnpm smoke` with `MCP_URL=https://mcp.killertools.net/mcp`, check a second MCP client, and publish the connection steps on the website. Public deployment and connection instructions are pending.
