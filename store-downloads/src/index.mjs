const PACKAGES = Object.freeze({
  killerpdf: { repo: "KillerPDF", file: "KillerPDF.exe" },
  killernotes: { repo: "KillerNotes", file: "KillerNotes.exe" },
  killerscan: { repo: "KillerScan", file: "KillerScan.exe" },
  killershell: { repo: "KillerShell", file: "KillerShell.exe" },
  killendar: { repo: "Killendar", file: "Killendar.exe" },
  killerbench: { repo: "KillerBench", file: "KillerBench.exe" },
  killermcp: { repo: "KillerMCP", file: "KillerMCP-Setup.exe" },
});

const RETURN_CODES = [
  ["Installation cancelled by user", "1223", "The user cancelled setup or declined an elevation request."],
  ["Application already exists", "Leave blank", "Existing installations can be updated or reinstalled; their presence is not an error."],
  ["Installation already in progress", "1618", "Another installer for this application owns the installation lock."],
  ["Disk space is full", "112", "Windows reported insufficient disk space."],
  ["Reboot required", "Leave blank", "These installers do not currently return a dedicated reboot-required code."],
  ["Network failure", "Leave blank", "The installers are offline; they do not return a dedicated network-download code."],
  ["Package rejected during installation", "1625", "A trust gate or security policy rejected installation."],
  ["Installation successful", "0", "Installation completed successfully."],
  ["Miscellaneous: general failure", "1", "An installation failure that does not match a specific code."],
  ["Miscellaneous: access denied", "5", "The account lacks permission to write required files or registration."],
  ["Miscellaneous: required runtime missing", "10", "A .NET 10 installer did not find its required runtime. Install the specified runtime first."],
];

function text(message, status = 400, extra = {}) {
  return new Response(message + "\n", {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", ...extra },
  });
}

function documentation(method) {
  const rows = RETURN_CODES.map(([scenario, code, meaning]) =>
    "<tr><td>" + scenario + "</td><td>" + code + "</td><td>" + meaning + "</td></tr>").join("");
  const html = "<!doctype html><html lang=\"en\"><meta charset=\"utf-8\">" +
    "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">" +
    "<title>Killer Tools installer return codes</title><main><h1>Killer Tools installer return codes</h1>" +
    "<p>These codes apply to releases containing the shared installer error handling. Older releases may return different codes.</p>" +
    "<p>Use /silent for unattended installation. A UAC elevation prompt may still appear for an all-users installation.</p>" +
    "<table><caption>Microsoft Store installer handling fields</caption><thead><tr><th>Scenario</th><th>Code</th><th>Meaning</th></tr></thead><tbody>" +
    rows + "</tbody></table><p>Code 10 is used by framework-dependent .NET 10 installers. .NET Framework 4.8 apps do not require .NET 10.</p>" +
    "<p>Get the .NET 10 Desktop Runtime for Windows x64 from <a href=\"https://dotnet.microsoft.com/en-us/download/dotnet/10.0\">Microsoft</a>. " +
    "For permission errors, use an administrator account for an all-users installation or select a per-user installation where supported.</p>" +
    "<p>For a general failure, keep the installer version and error message and contact <a href=\"mailto:steve@thekiller.net\">steve@thekiller.net</a>.</p></main></html>";
  return new Response(method === "HEAD" ? null : html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    },
  });
}

export async function handleRequest(request, upstreamFetch = fetch) {
  if (request.method !== "GET" && request.method !== "HEAD")
    return text("Only GET and HEAD are supported.", 405, { allow: "GET, HEAD" });
  const url = new URL(request.url);
  if (url.protocol !== "https:" || !["killerpdf.net", "killertools.net"].includes(url.hostname))
    return text("Unknown download host.", 404);
  if (url.search) return text("Use the versioned download URL without query parameters.");
  if (url.pathname === "/store/installer-codes") return documentation(request.method);

  let product, version, file;
  if (url.hostname === "killerpdf.net") {
    const match = /^\/store\/(\d+\.\d+\.\d+)\/(KillerPDF\.exe)$/.exec(url.pathname);
    if (match) [, version, file] = match;
    product = "killerpdf";
  } else {
    const match = /^\/store\/([a-z]+)\/(\d+\.\d+\.\d+)\/([^/]+)$/.exec(url.pathname);
    if (match) [, product, version, file] = match;
  }
  const entry = PACKAGES[product];
  if (!version || !entry || file !== entry.file)
    return text("Unknown versioned installer path.", 404);

  const headers = new Headers({ accept: "application/octet-stream", "accept-encoding": "identity" });
  const range = request.headers.get("range");
  if (range && !/^bytes=(?:\d+-\d*|-\d+)$/.test(range))
    return text("A single byte range is required.", 416);
  if (range) headers.set("range", range);
  for (const name of ["if-range", "if-none-match", "if-modified-since"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const origin = "https://github.com/SteveTheKiller/" + entry.repo + "/releases/download/v" + version + "/" + entry.file;
  let upstream;
  try {
    upstream = await upstreamFetch(origin, { method: request.method, headers, redirect: "follow" });
  } catch {
    return text("The release download is temporarily unavailable.", 502);
  }
  if (upstream.status === 404) return text("This release installer is not available.", 404);
  if (![200, 206, 304, 416].includes(upstream.status))
    return text("The release download is temporarily unavailable.", 502);
  const type = upstream.headers.get("content-type") || "";
  if (upstream.status !== 304 && upstream.status !== 416 && /text\/|json|html/i.test(type))
    return text("The release server did not return an installer.", 502);

  const responseHeaders = new Headers({
    "content-type": "application/octet-stream",
    "content-disposition": 'attachment; filename="' + entry.file + '"',
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  for (const name of ["content-length", "content-range", "accept-ranges", "etag", "last-modified"]) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  // GitHub's redirects are followed on the server. The caller receives the original byte stream.
  // Forward only allowlisted download headers; do not forward client credentials to GitHub.
  return new Response(request.method === "HEAD" || upstream.status === 304 ? null : upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export default { fetch(request) { return handleRequest(request); } };
