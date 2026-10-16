# Microsoft Store direct downloads

This Worker gives Partner Center a versioned installer URL with no client redirect.
It follows the GitHub release redirect on the server and streams the bytes without keeping
an installer copy in the website repository, R2, KV, or the Workers cache. The existing
/download redirect is outside these routes and remains unchanged.

## Local verification

Run `node --test test.mjs` in this directory. Tests cover streamed bytes, HEAD, ranges,
missing releases, upstream failures, host/path validation, and credential isolation.

## Deployment

Review the route patterns and use an authenticated Cloudflare account with access to
every zone. From this directory, run `npx wrangler deploy` only when publication is authorized.
A root www redirect, another Worker, or a redirect rule must not intercept /store/*.
Test the final public route with GET, HEAD, and a byte range before using Partner Center.

Each app's installer is served from its own site:
https://killerpdf.net/store/1.8.91/KillerPDF.exe
https://killernotes.net/store/1.5.0/KillerNotes.exe
https://killerscan.net/store/1.8.1/KillerScan.exe
https://killershell.net/store/1.4.0/KillerShell.exe
https://killendar.net/store/1.3.0/Killendar.exe
https://killerbench.net/store/0.1.0/KillerBench.exe

KillerMCP has no site of its own and uses the family host and product name:
https://killertools.net/store/killermcp/0.5.1/KillerMCP-Setup.exe

The release must exist on GitHub before its download works. Published versioned assets must
never be replaced; publish a new version for changed bytes. The Worker does not store or
change the signed payload and does not bypass Store certification. A live Partner Center
save is the final check that Microsoft accepts this deployment.

## Installer handling documentation

https://killertools.net/store/installer-codes

The same page is served at /store/installer-codes on every app site. This documentation applies only to releases containing the new shared installer handling.
Use 1223 for cancelled installation, 1618 for concurrent installation, 112 for disk full,
1625 for security rejection, and 0 for success. Leave already-exists, reboot-required, and
network-failure fields blank because those dedicated codes are not emitted. Put 1, 5, and
10 under miscellaneous failures using the documentation URL; 10 applies only to the
framework-dependent .NET 10 installers. KillerShot has no installer yet.
