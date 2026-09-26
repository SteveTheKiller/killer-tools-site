import type { McpServer } from '@modelcontextprotocol/server';
import {
  formatISO,
  formatISO9075,
  formatRFC3339,
  formatRFC7231,
  fromUnixTime,
  getTime,
  getUnixTime,
  isValid,
  parseISO,
} from 'date-fns';
import { z } from 'zod';
import { dateToExcelFormat, excelFormatToDate } from '../../src/tools/date-time-converter/date-time-converter.models';

const formats = ['iso8601', 'iso9075', 'rfc3339', 'rfc7231', 'unix_seconds', 'timestamp_ms', 'utc', 'mongo_object_id', 'excel'] as const;

export function registerDateTime(server: McpServer) {
  server.registerTool('convert_date_time', {
    description: 'Convert a date among the formats shown by KillerTools Date Time Converter. Worker output uses UTC.',
    inputSchema: {
      value: z.string().trim().min(1).max(128),
      inputFormat: z.enum(formats),
    },
  }, async ({ value, inputFormat }) => {
    let date: Date;
    try {
      switch (inputFormat) {
        case 'iso8601':
        case 'iso9075':
          date = parseISO(value);
          break;
        case 'unix_seconds':
          date = fromUnixTime(Number(value));
          break;
        case 'timestamp_ms':
          date = new Date(Number(value));
          break;
        case 'mongo_object_id':
          date = /^[0-9a-f]{24}$/i.test(value) ? new Date(Number.parseInt(value.slice(0, 8), 16) * 1000) : new Date(Number.NaN);
          break;
        case 'excel':
          date = excelFormatToDate(value);
          break;
        default: date = new Date(value);
      }
      if (!isValid(date)) {
        throw new Error('Invalid date');
      }
      const result = {
        iso8601: formatISO(date),
        iso9075: formatISO9075(date),
        rfc3339: formatRFC3339(date),
        rfc7231: formatRFC7231(date),
        unixSeconds: String(getUnixTime(date)),
        timestampMs: String(getTime(date)),
        utc: date.toUTCString(),
        mongoObjectId: `${Math.floor(date.getTime() / 1000).toString(16)}0000000000000000`,
        excel: dateToExcelFormat(date),
      };
      return { content: [{ type: 'text' as const, text: JSON.stringify(result) }] };
    }
    catch {
      return { content: [{ type: 'text' as const, text: 'Invalid date for selected format' }], isError: true };
    }
  });
}
