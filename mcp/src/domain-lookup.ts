import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';

const domain = z.string().trim().toLowerCase().min(4).max(253).regex(/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/);
const dnsName = z.string().trim().toLowerCase().min(4).max(253).regex(/^(?:[a-z0-9_](?:[a-z0-9_-]{0,61}[a-z0-9_])?\.)+[a-z]{2,63}$/);
let bootstrap: Map<string, string> | undefined;
let bootstrapExpires = 0;

async function boundedJson(response: Response, maxBytes: number): Promise<unknown> {
  if (!response.ok || !response.body) {
    throw new Error('Lookup unavailable');
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new Error('Lookup response too large');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

async function fetchRdap(name: string): Promise<unknown> {
  if (!bootstrap || Date.now() >= bootstrapExpires) {
    const registry = await boundedJson(await fetch('https://data.iana.org/rdap/dns.json', {
      signal: AbortSignal.timeout(10_000),
    }), 262_144) as { services?: Array<[string[], string[]]> };
    const next = new Map<string, string>();
    for (const [suffixes, endpoints] of registry.services ?? []) {
      const endpoint = endpoints.find((value) => {
        try {
          const url = new URL(value);
          return url.protocol === 'https:' && !url.port
            && /^(?:[a-z0-9-]+\.)+[a-z]{2,63}$/.test(url.hostname)
            && !/\.(?:localhost|local|internal|test|invalid)$/.test(url.hostname);
        }
        catch { return false; }
      });
      if (endpoint) {
        for (const suffix of suffixes) {
          next.set(suffix.toLowerCase(), endpoint);
        }
      }
    }
    bootstrap = next;
    bootstrapExpires = Date.now() + 86_400_000;
  }
  const tld = name.slice(name.lastIndexOf('.') + 1);
  const endpoint = bootstrap.get(tld);
  if (!endpoint) {
    throw new Error('RDAP registry unavailable');
  }
  const base = endpoint.endsWith('/') ? endpoint : `${endpoint}/`;
  const url = new URL(`domain/${encodeURIComponent(name)}`, base);
  const response = await fetch(url, {
    headers: { Accept: 'application/rdap+json' },
    redirect: 'manual',
    signal: AbortSignal.timeout(10_000),
  });
  return boundedJson(response, 131_072);
}

export function registerDomainLookup(server: McpServer) {
  server.registerTool('lookup_domain_dns', {
    description: 'Query DNS records through Cloudflare DNS, as used by KillerTools Domain Lookup.',
    inputSchema: {
      name: dnsName,
      type: z.enum(['A', 'AAAA', 'MX', 'TXT', 'CNAME', 'NS', 'CAA', 'SRV']).default('A'),
    },
  }, async ({ name, type }) => {
    try {
      const url = new URL('https://cloudflare-dns.com/dns-query');
      url.searchParams.set('name', name);
      url.searchParams.set('type', type);
      const data = await boundedJson(await fetch(url, {
        headers: { Accept: 'application/dns-json' },
        signal: AbortSignal.timeout(8000),
      }), 32_768) as { Status?: number, Answer?: Array<{ name?: string, type?: number, TTL?: number, data?: string }> };
      const answers = (data.Answer ?? []).slice(0, 30).map(answer => ({
        name: answer.name,
        type: answer.type,
        ttl: answer.TTL,
        data: answer.data?.slice(0, 4096),
      }));
      return { content: [{ type: 'text' as const, text: JSON.stringify({ status: data.Status ?? null, answers }) }] };
    }
    catch {
      return { content: [{ type: 'text' as const, text: 'DNS lookup is unavailable' }], isError: true };
    }
  });

  server.registerTool('lookup_domain_rdap', {
    description: 'Look up public domain registration details through RDAP, as used by KillerTools Domain Lookup.',
    inputSchema: { domain },
  }, async ({ domain }) => {
    try {
      const data = await fetchRdap(domain) as {
        ldhName?: string
        handle?: string
        status?: string[]
        events?: Array<{ eventAction?: string, eventDate?: string }>
        nameservers?: Array<{ ldhName?: string }>
        secureDNS?: { delegationSigned?: boolean }
        entities?: Array<{ roles?: string[], vcardArray?: unknown[] }>
      };
      const result = {
        domain: data.ldhName ?? domain,
        handle: data.handle ?? null,
        status: data.status?.slice(0, 20) ?? [],
        events: data.events?.slice(0, 20) ?? [],
        nameservers: data.nameservers?.slice(0, 20).map(server => server.ldhName).filter(Boolean) ?? [],
        dnssecSigned: data.secureDNS?.delegationSigned ?? null,
      };
      return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
    }
    catch {
      return { content: [{ type: 'text' as const, text: 'RDAP lookup is unavailable for this domain' }], isError: true };
    }
  });
}
