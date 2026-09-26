import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import {
  calcDilutionVolumes,
  developers,
  filmStocks,
  formatTime,
  pushPullAdjust,
  tempAdjust,
} from '../../src/tools/dev-calculator/dev-calculator.data';

function result(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value) }] };
}

function invalid(message: string) {
  return { content: [{ type: 'text' as const, text: message }], isError: true };
}

export function registerFilmDevelopment(server: McpServer) {
  server.registerTool('list_film_development_options', {
    description: 'List films and developers available in KillerTools Film Development Calculator.',
    inputSchema: {},
  }, async () => result({
    developers: developers.map(({ id, name, dilutions, defaultDilution }) => ({ id, name, dilutions, defaultDilution })),
    films: filmStocks.map(({ name, isoBase, process }) => ({ name, isoBase, process })),
  }));

  server.registerTool('calculate_film_development', {
    description: 'Calculate film development time and dilution volumes using KillerTools.',
    inputSchema: {
      filmName: z.string().min(1).max(128),
      developerId: z.string().min(1).max(32),
      dilutionIndex: z.number().int().min(0).max(10).optional(),
      baseSeconds: z.number().finite().min(1).max(10000).optional(),
      temperatureC: z.number().finite().min(10).max(42).optional(),
      pushPullStops: z.number().finite().min(-5).max(5).default(0),
      tankMl: z.number().finite().min(100).max(2000).default(500),
    },
  }, async ({ filmName, developerId, dilutionIndex, baseSeconds, temperatureC, pushPullStops, tankMl }) => {
    const film = filmStocks.find(item => item.name === filmName);
    const developer = developers.find(item => item.id === developerId);
    if (!film || !developer) {
      return invalid('Unknown film or developer');
    }
    const dilution = developer.dilutions[dilutionIndex ?? developer.defaultDilution];
    if (!dilution) {
      return invalid('Invalid dilution index');
    }
    const base = baseSeconds ?? film.times[developerId];
    if (base == null) {
      return invalid('A base development time is required for this combination');
    }
    const temperatureAdjustedSeconds = tempAdjust(base, temperatureC ?? film.baseTemp ?? 20, film.baseTemp ?? 20);
    const finalSeconds = pushPullAdjust(temperatureAdjustedSeconds, pushPullStops);
    return result({
      baseSeconds: base,
      temperatureAdjustedSeconds,
      finalSeconds,
      displayTime: formatTime(finalSeconds),
      dilution: dilution.label,
      ...calcDilutionVolumes(tankMl, dilution),
      process: film.process ?? 'bw',
    });
  });
}
