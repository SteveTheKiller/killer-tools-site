# KillerMCP directory package

This package presents the hosted KillerTools utilities under the existing KillerMCP product brand. Its live directory endpoint is `https://mcp.killertools.net/openai`. The directory endpoint exposes the same 74 public operations as the root endpoint. The QR operation encodes a Wi-Fi password only when the user supplies one; it never asks for one.

The OpenAI package version follows the published Windows KillerMCP release. The current local package is 0.5.0. Changing this source or rebuilding its ZIP does not update the pending OpenAI submission or deploy the hosted server.

The draft in the Killer Apps project uses the verified business identity Steve the Killer and includes 18 translated listing descriptions. The Worker, hosted legal pages and domain challenge are deployed. OpenAI confirms the domain is verified and the current MCP scan has no findings. All eight review prompts passed in ChatGPT. The [reviewer walkthrough](https://mcp.killertools.net/review/) uses actual client captures and is declared in the package. Final attestations, review submission and directory publication remain separate steps.

## Brand and copy

KillerMCP connects your AI assistant to KillerTools and your Killer apps.

Choose the hosted connection for IT lookups, calculations, data conversion and formatting without a Windows installation. Choose the installed Windows edition for those utilities plus supported local features and installed Killer app integrations. Available app actions depend on the installed app and its supported adapter.

The directory listing describes the hosted connection's actual capabilities. It does not advertise desktop operations as remotely available. KillerMCP is the existing product name, rather than a generic tool name with MCP appended for this listing.

## Prepare the package

From `mcp`, run `pnpm typecheck` and `pnpm coverage`. Start `pnpm exec wrangler dev --port 8792 --local` in a separate terminal. Then run:

```powershell
node scripts/review-plugin.mjs C:\Users\steve\code\tmp\killermcp-review-local.json
python scripts/build-openai-plugin.py C:\Users\steve\code\tmp\killermcp-openai-0.5.0.zip
pnpm exec wrangler deploy --dry-run
```

The builder validates the portable schemas, listing limits, all eight review cases, icon dimensions and ZIP contents. It copies the existing brand icon byte for byte. It never uploads, installs or publishes. Use a new output filename when rebuilding.

The protocol check runs five positive tool calls, checks 74 annotations, confirms the root, OpenAI and Claude routes expose the same tools, and verifies rejected inputs and legal routes. It does not test a model's selection or refusal behavior. Run the five positive and three negative prompts from `openai-plugin/plugin.json` in a connected ChatGPT or Codex client before submission.

## Remaining submission steps

1. Complete individual or business developer verification in the OpenAI Platform. Use the name verified by the selected developer identity. Update `author.name` and `interface.developerName` to match the chosen public publisher before uploading the final package.
2. Review the privacy and service terms in `legal/`. Confirm the operator name and data-handling description. Publish the Worker changes only with deployment authorization, then rerun the review script against `https://mcp.killertools.net/openai`.
3. Upload the ZIP in the [Plugins dashboard](https://platform.openai.com/plugins). This MCP service requires no sign-in or reviewer credentials.
4. Under MCPs, connect the endpoint and host the exact domain-verification challenge at the path shown by the portal. The token and hostname cannot be prepared before the portal generates them. Run the tool scan and resolve its findings.
5. Install the draft in a supported client and run all eight review prompts. Record a walkthrough showing those prompts and results. Host a reviewer-accessible video, then add its real URL to `extensions.com.openai.review.demo_recording_url` and rebuild the ZIP. The package contains no placeholder recording URL.
6. Resolve automated findings. Final attestations, review submission and publication are separate actions. Local preparation does not publish the plugin.

## Recording outline

Show the KillerMCP connection and explain that this is its hosted tools edition. Run subnet calculation, Windows Event ID lookup, Base64 conversion, JSON formatting and the PowerShell builder. Keep the built command as text; do not execute it. Then demonstrate all three negative prompts: local PDF editing, restarting a Windows service, and soliciting a Wi-Fi password. Show that those requests do not perform a local action or ask for a password.

Finish by showing the product website and the hosted privacy and terms pages. Explain the installed Windows edition as a separate connection. Do not suggest that the hosted plugin controlled a computer during the recording.

## Official references

- [Package format](https://developers.openai.com/plugins/build/plugins)
- [Submission flow](https://developers.openai.com/plugins/deploy/submission)
- [Directory requirements](https://developers.openai.com/plugins/plugin-guidelines)

OpenAI's portal performs the authoritative submission checks. A locally validated ZIP is a draft package, not a published listing or guaranteed approval.
