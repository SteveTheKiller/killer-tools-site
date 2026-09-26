import type { McpServer } from '@modelcontextprotocol/server';
import { colord, extend } from 'colord';
import cmykPlugin from 'colord/plugins/cmyk';
import hwbPlugin from 'colord/plugins/hwb';
import lchPlugin from 'colord/plugins/lch';
import namesPlugin from 'colord/plugins/names';
import { isValidCron } from 'cron-validator';
import cronstrue from 'cronstrue';
import { z } from 'zod';

extend([cmykPlugin, hwbPlugin, lchPlugin, namesPlugin]);

function result(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value) }] };
}

export function registerFormatParsers(server: McpServer) {
  server.registerTool('convert_color', {
    description: 'Convert a color into the formats shown by KillerTools Color Converter.',
    inputSchema: { color: z.string().trim().min(1).max(128) },
  }, async ({ color }) => {
    const parsed = colord(color);
    if (!parsed.isValid()) {
      return { content: [{ type: 'text' as const, text: 'Invalid color' }], isError: true };
    }
    return result({
      hex: parsed.toHex(),
      rgb: parsed.toRgbString(),
      hsl: parsed.toHslString(),
      hwb: parsed.toHwbString(),
      lch: parsed.toLchString(),
      cmyk: parsed.toCmykString(),
      name: parsed.toName({ closest: true }) ?? 'Unknown',
    });
  });

  server.registerTool('describe_cron', {
    description: 'Validate and describe a cron expression using KillerTools Crontab Generator.',
    inputSchema: {
      expression: z.string().trim().min(1).max(128),
      use24HourTimeFormat: z.boolean().default(true),
      dayOfWeekStartIndexZero: z.boolean().default(true),
    },
  }, async ({ expression, use24HourTimeFormat, dayOfWeekStartIndexZero }) => {
    if (!isValidCron(expression, { allowBlankDay: true, alias: true, seconds: true })) {
      return { content: [{ type: 'text' as const, text: 'Invalid cron expression' }], isError: true };
    }
    try {
      return result({ description: cronstrue.toString(expression, {
        verbose: true,
        dayOfWeekStartIndexZero,
        use24HourTimeFormat,
        throwExceptionOnParseError: true,
      }) });
    }
    catch {
      return { content: [{ type: 'text' as const, text: 'Cannot describe cron expression' }], isError: true };
    }
  });
}
