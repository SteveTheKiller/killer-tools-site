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

- **Exchange NDR Lookup** looks up Exchange and M365 bounce codes with plain-language cause and fix guidance
- **Group Policy Reference** searches common Windows GPO settings by name, path, registry key, or description
- **Windows Error Code Lookup** covers hex and decimal lookup for system errors, BSODs, WMI, RPC, and MSI errors
- **Windows Event Lookup** provides event IDs with descriptions, severity levels, and common causes
- **Domain Lookup** pulls WHOIS registration details and email DNS checks (MX, SPF, DKIM, DMARC) for any domain in a single view
- **Email Header Parser** lets you paste raw headers to trace the delivery hop chain and view auth results
- **CVE Lookup** runs live searches against the NIST NVD by ID or keyword
- **Port & Protocol Reference** lists common ports and protocols with security notes and dangerous port flags
- **Outlook SafeLink Decoder** unwraps Microsoft Defender SafeLinks to reveal the original destination URL
- **M365 License SKU Decoder** converts Microsoft 365 license SKU strings and GUIDs to readable product names
- **PowerShell Builder** lets you pick a cmdlet, fill in parameters, and copy the finished command
- **Killer Scripts** is a library of PowerShell scripts for Windows administration and MSP field work

---

## Killer Apps

Standalone executables for field work. No installer, no runtime, no dependencies.

| App | Description |
|-----|-------------|
| [KillerScan](https://scan.killertools.net) | Fast network scanner. ARP and ping discovery, port probing, vendor lookup, and automatic device classification. |
| [KillerPDF](https://pdf.killertools.net) | Portable PDF editor. View, annotate, merge, split, flatten, sign, and open password-protected files. |
| [KillerFind](https://find.killertools.net) | Fast file search for Windows. Search by filename, wildcard, or file content across any directory. |

> [!WARNING]
> **Windows Defender may flag these as threats.** They are false positives. These executables do network scanning and file system access, which heuristic engines flag on unknown binaries. There is no telemetry, no outbound callback, and nothing writing to system paths. Code signing is in progress. In the meantime, the source is public and SHA-256 hashes are provided on each tool's page.

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
