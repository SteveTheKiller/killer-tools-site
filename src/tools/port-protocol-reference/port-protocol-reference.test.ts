import { describe, expect, it } from 'vitest';
import { portCategories } from './port-protocol-reference.constants';

describe('firewall port reference', () => {
  it('finds common firewall services by vendor without losing shared-port services', () => {
    const ports = portCategories.flatMap(group => group.ports);
    for (const [vendor, port, protocol] of [
      ['Fortinet', 541, 'TCP'],
      ['Fortinet', 8013, 'TCP'],
      ['SonicWall', 4433, 'TCP'],
      ['Palo Alto', 3978, 'TCP'],
      ['Sophos', 4444, 'TCP'],
      ['Check Point', 18190, 'TCP'],
      ['Cisco', 8305, 'TCP'],
      ['WatchGuard', 8080, 'TCP'],
      ['UniFi', 8080, 'TCP'],
      ['UniFi', 3478, 'UDP'],
      ['MikroTik', 8291, 'TCP'],
    ] as const) {
      expect(ports.some(entry => entry.port === port && entry.protocol === protocol
        && `${entry.service} ${entry.description}`.includes(vendor)), `${vendor} ${protocol}/${port}`).toBe(true);
    }
    expect(ports.some(entry => entry.port === 8080 && entry.service === 'HTTP Alternate')).toBe(true);
    expect(ports.some(entry => entry.service.includes('Calyptix') && entry.notes?.includes('configur'))).toBe(true);
  });
});
