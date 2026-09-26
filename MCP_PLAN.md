# KillerTools MCP plan

## Goal

Let MCP clients use the website's useful operations through a public endpoint at `mcp.killertools.net/mcp`. Keep each operation's behavior in one TypeScript implementation shared by the Vue page and the MCP adapter.

## Server boundaries

`KillerTools MCP` covers the browser tools in this repository. Its Worker lives in `mcp/`, and the website shares the underlying TypeScript functions with it. The product links for KillerPDF, KillerScan, KillerNotes, KillerShell, and Killendar are not operations of this server. Give each desktop app its own MCP server in that app's repository if an agent-facing API is useful there. Each app can then define its own installation, permissions, and tool list. `KillerMCP` can remain a family label without requiring one server to own every app.

Keep tool names and server metadata specific to KillerTools. A client that connects to several family servers should be able to tell which app owns each operation.

## Execution order

1. Inventory every `src/tools` directory. Record whether its useful operation is pure TypeScript, needs a browser feature, calls another service, handles files or secrets, or links to a desktop product. A directory is not automatically an MCP tool.
2. Extract useful operations that currently live inside Vue components into small functions with explicit inputs and outputs. Preserve the website's behavior and add focused tests for each extraction. The Case Converter is the first extraction; the Base64 converter already imports shared functions.
3. Build a local, stateless MCP adapter with the current MCP SDK and Cloudflare's `createMcpHandler`. Register a small set of read-only tools with bounded input schemas, structured results, and clear errors. Call the shared functions directly.
4. Verify MCP initialization, tool discovery, valid calls, invalid inputs, result size limits, and concurrent calls with MCP Inspector and an automated client. Confirm the website still passes its relevant checks.
5. Review privacy and operating limits before public access. The website currently processes data in the browser. A hosted MCP call sends inputs to the server, so document that difference. Add request limits and abuse controls before enabling broad access. Keep secrets, credentials, private files, and state-changing actions out of the public first release.
6. Deploy the verified Worker and connect `mcp.killertools.net`. Test the public URL from Codex and another MCP client, then publish connection instructions on the site.
7. Expand coverage in batches. Reuse shared logic, test each adapter, and record unsupported browser or desktop interactions honestly.

## First release candidates

- Case conversion
- Base64 string conversion
- Text to ASCII binary conversion

These are small, deterministic operations already implemented on the site. The public endpoint and DNS are not configured yet.
