import type { McpServer } from '@modelcontextprotocol/server';
import { Netmask } from 'netmask';
import { z } from 'zod';
import { buildDmarcRecord, buildSpfRecord } from '../../src/tools/email-record-generator/email-record-generator.service';

const providers = [
  'include:spf.protection.outlook.com',
  'include:_spf.google.com',
  'include:sendgrid.net',
  'include:spf.mandrillapp.com',
  'include:mailgun.org',
  'include:amazonses.com',
  'include:zoho.com',
  'include:spf.mtasv.net',
  'include:_spf.protonmail.ch',
  'include:spf.messagingengine.com',
  'include:hubspot.com',
  'include:mail.zendesk.com',
  'include:email.freshdesk.com',
  'include:_spf.salesforce.com',
  'include:_netblocks.mimecast.com',
] as const;

function validIpOrRange(value: string): boolean {
  const [address, prefix, extra] = value.split('/');
  if (extra !== undefined) {
    return false;
  }
  if (address.includes(':')) {
    if (prefix !== undefined && (!/^\d{1,3}$/.test(prefix) || Number(prefix) > 128)) {
      return false;
    }
    try {
      return new URL(`http://[${address}]/`).hostname.length > 0;
    }
    catch {
      return false;
    }
  }
  if (prefix !== undefined && (!/^\d{1,2}$/.test(prefix) || Number(prefix) > 32)) {
    return false;
  }
  try {
    const network = new Netmask(prefix === undefined ? address : `${address}/${prefix}`);
    return network.base.length > 0;
  }
  catch {
    return false;
  }
}

function result(record: string) {
  return { content: [{ type: 'text' as const, text: JSON.stringify({ record }) }] };
}

export function registerEmailRecords(server: McpServer) {
  server.registerTool('generate_spf_record', {
    description: 'Build an SPF TXT record using the KillerTools Email Record Generator.',
    inputSchema: {
      providers: z.array(z.enum(providers)).max(15).default([]),
      ipAddresses: z.array(z.string().min(1).max(64)).max(20).default([]),
      enforcement: z.enum(['-all', '~all', '?all']).default('-all'),
    },
  }, async ({ providers: selected, ipAddresses, enforcement }) => {
    if (ipAddresses.some(ip => !validIpOrRange(ip))) {
      return { content: [{ type: 'text' as const, text: 'Invalid IP address or range' }], isError: true };
    }
    return result(buildSpfRecord({
      providers: [...new Set(selected)],
      customIps: ipAddresses.join(' '),
      enforcement,
    }));
  });

  server.registerTool('generate_dmarc_record', {
    description: 'Build a DMARC TXT record using the KillerTools Email Record Generator.',
    inputSchema: {
      policy: z.enum(['reject', 'quarantine', 'none']).default('reject'),
      subdomainPolicy: z.enum(['reject', 'quarantine', 'none', '']).default(''),
      percentage: z.number().int().min(0).max(100).default(100),
      ruaEmails: z.array(z.email().max(254)).max(5).default([]),
      rufEmails: z.array(z.email().max(254)).max(5).default([]),
      adkim: z.enum(['', 's']).default(''),
      aspf: z.enum(['', 's']).default(''),
    },
  }, async ({ policy, subdomainPolicy, percentage, ruaEmails, rufEmails, adkim, aspf }) => result(buildDmarcRecord({
    policy,
    subdomainPolicy,
    percentage,
    ruaEmail: ruaEmails.join(','),
    rufEmail: rufEmails.join(','),
    adkim,
    aspf,
  })));
}
