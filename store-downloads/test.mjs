import assert from "node:assert/strict";
import test from "node:test";
import { handleRequest } from "./src/index.mjs";

const url = "https://killerpdf.net/store/1.8.90/KillerPDF.exe";
test("versioned download streams bytes without a client redirect or persistent copy", async () => {
  let source, options;
  const response = await handleRequest(new Request(url), async (u, o) => {
    source = u; options = o;
    return new Response(new Uint8Array([77, 90, 1, 2]), {
      headers: { "content-length": "4", location: "https://example.invalid", "set-cookie": "private=1" },
    });
  });
  assert.equal(source, "https://github.com/SteveTheKiller/KillerPDF/releases/download/v1.8.90/KillerPDF.exe");
  assert.equal(options.redirect, "follow");
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("location"), null);
  assert.equal(response.headers.get("set-cookie"), null);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [77, 90, 1, 2]);
});
test("HEAD retains file metadata without reading or returning a body", async () => {
  const response = await handleRequest(new Request(url, { method: "HEAD" }), async (_, o) => {
    assert.equal(o.method, "HEAD");
    return new Response(null, { headers: { "content-length": "456" } });
  });
  assert.equal(response.headers.get("content-length"), "456");
  assert.equal(await response.text(), "");
});
test("range requests preserve status and exact range metadata", async () => {
  const response = await handleRequest(new Request(url, { headers: { range: "bytes=0-1" } }), async (_, o) => {
    assert.equal(o.headers.get("range"), "bytes=0-1");
    return new Response("MZ", { status: 206, headers: { "content-range": "bytes 0-1/456", "content-type": "application/octet-stream" } });
  });
  assert.equal(response.status, 206);
  assert.equal(response.headers.get("content-range"), "bytes 0-1/456");
  assert.equal(await response.text(), "MZ");
});
test("request credentials and arbitrary headers do not reach GitHub", async () => {
  await handleRequest(new Request(url, { headers: { authorization: "secret", cookie: "secret", "x-private": "secret" } }), async (_, o) => {
    for (const name of ["authorization", "cookie", "x-private"]) assert.equal(o.headers.get(name), null);
    return new Response("MZ");
  });
});
test("each app site serves its own installer", async () => {
  for (const [host, repo, file] of [["killernotes.net", "KillerNotes", "KillerNotes.exe"], ["killerscan.net", "KillerScan", "KillerScan.exe"],
    ["killershell.net", "KillerShell", "KillerShell.exe"], ["killendar.net", "Killendar", "Killendar.exe"],
    ["killerbench.net", "KillerBench", "KillerBench.exe"]]) {
    await handleRequest(new Request(`https://${host}/store/1.2.3/${file}`), async u => {
      assert.equal(u, `https://github.com/SteveTheKiller/${repo}/releases/download/v1.2.3/${file}`);
      return new Response("MZ");
    });
  }
});
test("installer return codes are documented on every app site", async () => {
  for (const host of ["killerpdf.net", "killerscan.net", "killernotes.net", "killershell.net", "killendar.net", "killerbench.net"])
    assert.equal((await handleRequest(new Request(`https://${host}/store/installer-codes`))).status, 200);
});
test("family paths select only the allowed repository and installer", async () => {
  await handleRequest(new Request("https://killertools.net/store/killermcp/0.5.1/KillerMCP-Setup.exe"), async u => {
    assert.equal(u, "https://github.com/SteveTheKiller/KillerMCP/releases/download/v0.5.1/KillerMCP-Setup.exe");
    return new Response("MZ");
  });
});
for (const bad of [
  "https://killerpdf.net/download", "https://killerpdf.net/store/latest/KillerPDF.exe",
  "https://killerpdf.net/store/1.8.90/Other.exe", "https://evil.invalid/store/1.8.90/KillerPDF.exe",
  "http://killerpdf.net/store/1.8.90/KillerPDF.exe",
  "https://killertools.net/store/unknown/1.0.0/Unknown.exe",
  "https://killerscan.net/store/1.8.1/KillerPDF.exe", "https://killerscan.net/store/killerscan/1.8.1/KillerScan.exe",
  "https://killernotes.net/store/latest/KillerNotes.exe",
  url + "?source=https://evil.invalid",
]) test("rejects unapproved path " + bad, async () => {
  const response = await handleRequest(new Request(bad), async () => { throw new Error("Unexpected upstream request"); });
  assert.ok(response.status >= 400);
});
test("rejects unsupported methods and multiple ranges", async () => {
  assert.equal((await handleRequest(new Request(url, { method: "POST" }))).status, 405);
  assert.equal((await handleRequest(new Request(url, { headers: { range: "bytes=0-1,5-8" } }))).status, 416);
});
test("unpublished releases retain a useful 404 without redirecting", async () => {
  assert.equal((await handleRequest(new Request(url), async () => new Response(null, { status: 404 }))).status, 404);
});
test("upstream errors and HTML are not presented as installers", async () => {
  for (const mock of [() => Promise.reject(new Error("Network")),
    () => new Response("login", { headers: { "content-type": "text/html" } }),
    () => new Response(null, { status: 302 })]) {
    assert.equal((await handleRequest(new Request(url), mock)).status, 502);
  }
});
test("documentation maps every Store field without invented failure codes", async () => {
  const response = await handleRequest(new Request("https://killertools.net/store/installer-codes"));
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const value of ["1223", "1618", "112", "1625", "Installation successful", "Leave blank", "10"]) assert.ok(html.includes(value));
  assert.ok(!html.includes("3010"));
});
