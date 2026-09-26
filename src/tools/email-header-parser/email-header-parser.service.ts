interface Hop {
  from: string
  by: string
  ip: string
  timestamp: string
  delay: string
}

interface AuthResult {
  protocol: string
  result: string
  detail: string
}

export interface ParsedHeaders {
  fields: { label: string, value: string }[]
  hops: Hop[]
  auth: AuthResult[]
  spamScore: string | null
  spamStatus: string | null
  scl: string | null
  sclLabel: string
  senderMismatch: boolean
  sendingService: string
}

function getHeader(lines: string[], name: string): string {
  const lower = name.toLowerCase();
  const found = lines.find((l: string) => l.toLowerCase().startsWith(`${lower}:`));
  return found ? found.slice(name.length + 1).trim() : '';
}

function getAllHeaders(lines: string[], name: string): string[] {
  const lower = name.toLowerCase();
  return lines
    .filter((l: string) => l.toLowerCase().startsWith(`${lower}:`))
    .map((l: string) => l.slice(name.length + 1).trim());
}

function extractIp(text: string): string {
  const match = text.match(/\[(\d{1,3}(?:\.\d{1,3}){3})\]/);
  if (match) {
    return match[1];
  }
  const bare = text.match(/\b(\d{1,3}(?:\.\d{1,3}){3})\b/);
  return bare ? bare[1] : '';
}

function extractEmail(str: string): string {
  const match = str.match(/<([^>]+)>/);
  return match ? match[1].trim() : str.trim();
}

function extractDomain(email: string): string {
  const at = email.lastIndexOf('@');
  return at >= 0 ? email.slice(at + 1).toLowerCase() : '';
}

function getSclLabel(scl: string): string {
  const n = Number.parseInt(scl);
  if (Number.isNaN(n)) {
    return '';
  }
  if (n === -1) {
    return 'Trusted / Bypass';
  }
  if (n <= 1) {
    return 'Not Spam';
  }
  if (n <= 4) {
    return 'Low Suspicion';
  }
  if (n <= 6) {
    return 'Spam';
  }
  return 'High Confidence Spam';
}

function detectSendingService(lines: string[]): string {
  const received = getAllHeaders(lines, 'Received').join(' ').toLowerCase();
  const feedbackId = getHeader(lines, 'Feedback-ID').toLowerCase();
  const xMailer = getHeader(lines, 'X-Mailer').toLowerCase();
  if (getHeader(lines, 'X-SES-Outgoing') || received.includes('amazonses.com')) {
    return 'Amazon SES';
  }
  if (getHeader(lines, 'X-SG-ID') || getHeader(lines, 'X-Sendgrid-ID') || received.includes('sendgrid.net')) {
    return 'SendGrid';
  }
  if (feedbackId.includes('mailchimp') || received.includes('mailchimp.com')) {
    return 'Mailchimp';
  }
  if (feedbackId.includes('salesforce') || received.includes('exacttarget.com') || received.includes('salesforce.com')) {
    return 'Salesforce Marketing Cloud';
  }
  if (received.includes('sendinblue.com') || received.includes('brevo.com')) {
    return 'Brevo (Sendinblue)';
  }
  if (received.includes('constantcontact.com')) {
    return 'Constant Contact';
  }
  if (received.includes('hubspot.com')) {
    return 'HubSpot';
  }
  if (received.includes('smtp.gmail.com') || received.includes('google.com')) {
    return 'Google Workspace / Gmail';
  }
  if (getHeader(lines, 'X-MS-Exchange-Organization-SCL') || received.includes('protection.outlook.com') || received.includes('outlook.com')) {
    return 'Microsoft 365 / Exchange';
  }
  if (received.includes('zoho.com')) {
    return 'Zoho Mail';
  }
  if (received.includes('protonmail.ch') || received.includes('proton.me')) {
    return 'Proton Mail';
  }
  if (xMailer.includes('apple mail')) {
    return 'Apple Mail';
  }
  return '';
}

function parseReceivedHops(receivedHeaders: string[]): Hop[] {
  const hops: Hop[] = [];
  const dates: (Date | null)[] = [];

  for (const raw of receivedHeaders) {
    const dateMatch = raw.match(/;(.+)$/);
    const dateStr = dateMatch ? dateMatch[1].trim() : '';
    const date = dateStr ? new Date(dateStr) : null;
    dates.push(date);

    const fromMatch = raw.match(/from\s+([^\s(]+)/i);
    const byMatch = raw.match(/by\s+([^\s(]+)/i);

    hops.push({
      from: fromMatch ? fromMatch[1] : '',
      by: byMatch ? byMatch[1] : '',
      ip: extractIp(raw),
      timestamp: dateStr,
      delay: '',
    });
  }

  for (let i = 0; i < hops.length - 1; i++) {
    const curr = dates[i];
    const next = dates[i + 1];
    if (curr && next) {
      const diff = Math.round((curr.getTime() - next.getTime()) / 1000);
      hops[i].delay = diff >= 0 ? `+${diff}s` : `${diff}s`;
    }
  }

  return hops;
}

function parseAuthResults(lines: string[]): AuthResult[] {
  const authHeaders = getAllHeaders(lines, 'Authentication-Results');
  const results: AuthResult[] = [];

  for (const header of authHeaders) {
    const protocols = ['spf', 'dkim', 'dmarc', 'arc'];
    for (const proto of protocols) {
      const rx = new RegExp(`${proto}=([a-z]+)([^;]*)`, 'gi');
      let match;
      // eslint-disable-next-line no-cond-assign
      while ((match = rx.exec(header)) !== null) {
        results.push({
          protocol: proto.toUpperCase(),
          result: match[1].toLowerCase(),
          detail: match[2].trim().replace(/\s+/g, ' '),
        });
      }
    }
  }

  return results;
}

export function parseRawHeaders(rawHeaders: string): ParsedHeaders {
  const raw = rawHeaders.trim();

  const unfolded = raw.replace(/\r?\n[ \t]+/g, ' ');
  const lines = unfolded.split(/\r?\n/).filter((l: string) => l.includes(':'));

  const fromRaw = getHeader(lines, 'From');
  const senderRaw = getHeader(lines, 'Sender');
  const fromDomain = extractDomain(extractEmail(fromRaw));
  const senderDomain = extractDomain(extractEmail(senderRaw));
  const senderMismatch = !!(senderRaw && fromDomain && senderDomain && fromDomain !== senderDomain);

  const sclRaw = getHeader(lines, 'X-MS-Exchange-Organization-SCL') || null;
  const sendingService = detectSendingService(lines);

  const fields: { label: string, value: string }[] = [
    { label: 'From', value: fromRaw },
    { label: 'Sender', value: senderRaw },
    { label: 'To', value: getHeader(lines, 'To') },
    { label: 'Delivered-To', value: getHeader(lines, 'Delivered-To') || getHeader(lines, 'X-Forwarded-To') },
    { label: 'Reply-To', value: getHeader(lines, 'Reply-To') },
    { label: 'Return-Path', value: getHeader(lines, 'Return-Path') },
    { label: 'Subject', value: getHeader(lines, 'Subject') },
    { label: 'Date', value: getHeader(lines, 'Date') },
    { label: 'Message-ID', value: getHeader(lines, 'Message-ID') },
    { label: 'Sending Service', value: sendingService },
    { label: 'X-Originating-IP', value: getHeader(lines, 'X-Originating-IP') || getHeader(lines, 'X-Sender-IP') },
    { label: 'X-Mailer', value: getHeader(lines, 'X-Mailer') },
    { label: 'MIME-Version', value: getHeader(lines, 'MIME-Version') },
  ].filter(f => f.value);

  const receivedRaw = getAllHeaders(lines, 'Received');
  const hops = parseReceivedHops(receivedRaw);
  const auth = parseAuthResults(lines);

  const spamScore = getHeader(lines, 'X-Spam-Score') || getHeader(lines, 'X-Spam-Level') || null;
  const spamStatus = getHeader(lines, 'X-Spam-Status') || null;

  return {
    fields,
    hops,
    auth,
    spamScore,
    spamStatus,
    scl: sclRaw,
    sclLabel: sclRaw ? getSclLabel(sclRaw) : '',
    senderMismatch,
    sendingService,
  };
}
