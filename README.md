# killer-tools

![killer-tools](./public/banner.png)

Field techs don't have time for bloat. Every tool here exists because I needed it on the job and couldn't find something that just worked without an account, an install, or telemetry.

I'm a field tech at an MSP handling networking, sysadmin work, and endpoint support. killer-tools started as a fork of the excellent [IT-Tools](https://github.com/CorentinTh/it-tools) project by [Corentin Thomasset](https://github.com/CorentinTh) and grew into something built for the kind of work I actually do. I built it to look up Group Policy settings mid-ticket, scan a client's subnet, and pull port references without leaving the browser. The [Killer Scripts](https://github.com/SteveTheKiller/killer-scripts) library covers the jobs that come up every ticket cycle. Every script runs in PS 5.1, PS 7, and Kaseya LiveConnect with no dependencies.

Everything runs in your browser. Nothing is tracked. No account is required, ever.

**Live site:** [killertools.net](https://killertools.net)  
Built and maintained by [Steve the Killer](https://thekiller.net).

---

## Notable Tools

A sampling of what's built into the site beyond the standard IT-Tools toolkit.

| Tool | Description |
|------|-------------|
| **Exchange NDR Lookup** | Look up Exchange and M365 bounce codes with plain-language cause and fix guidance |
| **Group Policy Reference** | Search common Windows GPO settings by name, path, registry key, or description |
| **Windows Error Code Lookup** | Hex or decimal lookup covering system errors, BSODs, WMI, RPC, and MSI errors |
| **Windows Event Lookup** | Event IDs with descriptions, severity levels, and common causes |
| **Domain Lookup** | WHOIS registration details and email DNS checks (MX, SPF, DKIM, DMARC) for any domain in a single view |
| **Email Header Parser** | Paste raw headers to trace the delivery hop chain and view auth results |
| **CVE Lookup** | Live search against the NIST NVD by ID or keyword |
| **Port & Protocol Reference** | Common ports and protocols with security notes and dangerous port flags |
| **M365 License SKU Decoder** | Convert Microsoft 365 license SKU strings and GUIDs to readable product names |
| **PowerShell Builder** | Pick a cmdlet, fill in parameters, and copy the finished command |
| **Killer Scripts** | PowerShell scripts for Windows administration and MSP field work |

---

## Killer Apps

Standalone executables for field work. No installer, no runtime, no dependencies.

| App | Description |
|-----|-------------|
| [KillerScan](https://scan.killertools.net) | Fast network scanner. ARP and ping discovery, port probing, vendor lookup, and automatic device classification. |
| [KillerPDF](https://pdf.killertools.net) | Portable PDF editor. View, annotate, merge, split, flatten, sign, and open password-protected files. |
| [KillerFind](https://find.killertools.net) | Fast file search for Windows. Search by filename, wildcard, or file content across any directory. |

> [!WARNING]
> **Windows Defender may flag these as threats.** These are false positives. Network scanning and file system access trigger heuristic flags on new binaries. There is no telemetry, no outbound callback, and nothing written to system paths. All apps are code signed with a Certum certificate. SHA-256 hashes are provided on each tool's page.

---

## Development

### Requirements

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/)

### Setup

```sh
pnpm install
```

### Dev server

```sh
pnpm dev
```

### Build for production

```sh
pnpm build
```

### Tests

```sh
pnpm test
```

### Lint

```sh
pnpm lint
```

### Create a new tool

```sh
pnpm run script:create:tool my-tool-name
```

This generates the boilerplate in `src/tools/` and adds the import to `src/tools/index.ts`. Add the tool to the appropriate category and build it out from there.

### Recommended VS Code extensions

- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur)
- [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

Recommended workspace settings:

```json
{
  "editor.formatOnSave": false,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

---

## Contributing

Open a feature request or bug report in the [issues section](https://github.com/SteveTheKiller/killer-tools-site/issues/new/choose). I read them.

If this saves you time on the job, [buying me a coffee](https://www.buymeacoffee.com/StevetheKiller) is appreciated but never expected.

---

## License

This project is under the [GNU GPLv3](LICENSE).
