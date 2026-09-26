export interface SpfRecordOptions {
  providers: string[]
  customIps: string
  enforcement: string
}

export interface DmarcRecordOptions {
  policy: string
  subdomainPolicy: string
  percentage: number
  ruaEmail: string
  rufEmail: string
  adkim: string
  aspf: string
}

export function buildSpfRecord({ providers, customIps, enforcement }: SpfRecordOptions): string {
  const parts = ['v=spf1', ...providers];
  const ips = customIps.split(/[\s,;]+/).map(ip => ip.trim()).filter(Boolean);
  for (const ip of ips) {
    parts.push(ip.includes(':') ? `ip6:${ip}` : `ip4:${ip}`);
  }
  parts.push(enforcement);
  return parts.join(' ');
}

export function buildDmarcRecord(options: DmarcRecordOptions): string {
  const parts = [`v=DMARC1; p=${options.policy}`];
  if (options.subdomainPolicy) {
    parts.push(`sp=${options.subdomainPolicy}`);
  }
  if (options.percentage < 100) {
    parts.push(`pct=${options.percentage}`);
  }
  for (const [tag, value] of [['rua', options.ruaEmail], ['ruf', options.rufEmail]]) {
    if (value.trim()) {
      const emails = value.split(/[\s,;]+/).filter(Boolean).map(e => `mailto:${e.replace(/^mailto:/, '')}`).join(',');
      parts.push(`${tag}=${emails}`);
    }
  }
  if (options.adkim) {
    parts.push(`adkim=${options.adkim}`);
  }
  if (options.aspf) {
    parts.push(`aspf=${options.aspf}`);
  }
  return parts.join('; ');
}
