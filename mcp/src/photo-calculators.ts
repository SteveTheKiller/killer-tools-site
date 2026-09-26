import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { filmStocks } from '../../src/tools/reciprocity-calculator/reciprocity.data';

const positive = z.number().finite().min(0.0001);

function result(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value) }] };
}

export function registerPhotoCalculators(server: McpServer) {
  server.registerTool('calculate_nd_exposure', {
    description: 'Calculate exposure time with an ND filter using KillerTools.',
    inputSchema: { baseSeconds: positive.max(3600), stops: z.number().finite().min(0).max(20) },
  }, async ({ baseSeconds, stops }) => result({ seconds: baseSeconds * (2 ** stops) }));

  server.registerTool('calculate_exposure_equivalence', {
    description: 'Calculate equivalent shutter time after an aperture change using KillerTools.',
    inputSchema: {
      shutterSeconds: positive.max(3600),
      originalAperture: positive.max(128),
      targetAperture: positive.max(128),
    },
  }, async ({ shutterSeconds, originalAperture, targetAperture }) =>
    result({ shutterSeconds: shutterSeconds * (targetAperture ** 2) / (originalAperture ** 2) }));

  server.registerTool('calculate_depth_of_field', {
    description: 'Calculate hyperfocal distance, focus limits, and depth of field using KillerTools.',
    inputSchema: {
      focalLengthMm: positive.max(2000),
      aperture: positive.max(128),
      focusDistance: positive.max(1_000_000),
      focusUnit: z.enum(['m', 'ft']),
      circleOfConfusionMm: positive.max(1),
    },
  }, async ({ focalLengthMm: f, aperture, focusDistance, focusUnit, circleOfConfusionMm: c }) => {
    const d = focusDistance * (focusUnit === 'ft' ? 0.3048 : 1) * 1000;
    if (d <= f) {
      return { content: [{ type: 'text' as const, text: 'Focus distance must exceed focal length' }], isError: true };
    }
    const hyperfocal = (f ** 2) / (aperture * c) + f;
    const near = (d * (hyperfocal - f)) / (hyperfocal + d - 2 * f);
    const far = d >= hyperfocal ? null : (d * (hyperfocal - f)) / (hyperfocal - d);
    return result({
      hyperfocalMeters: hyperfocal / 1000,
      nearMeters: near / 1000,
      farMeters: far === null ? null : far / 1000,
      depthOfFieldMeters: far === null ? null : (far - near) / 1000,
    });
  });

  server.registerTool('list_film_stocks', {
    description: 'List the film stocks available in KillerTools Reciprocity Calculator.',
    inputSchema: {},
  }, async () => result(filmStocks.map(({ id, name, manufacturer, iso, type }) => ({ id, name, manufacturer, iso, type }))));

  server.registerTool('calculate_reciprocity', {
    description: 'Calculate reciprocity failure adjustment for a film stock using KillerTools.',
    inputSchema: { filmStockId: z.string().min(1).max(64), meteredSeconds: positive.max(3600) },
  }, async ({ filmStockId, meteredSeconds }) => {
    const stock = filmStocks.find(item => item.id === filmStockId);
    if (!stock) {
      return { content: [{ type: 'text' as const, text: 'Unknown film stock' }], isError: true };
    }
    const noFailure = stock.noFailureUpTo != null && meteredSeconds <= stock.noFailureUpTo;
    const adjustedSeconds = noFailure ? meteredSeconds : meteredSeconds ** stock.exponent;
    const extraStops = noFailure ? 0 : Math.log2(adjustedSeconds / meteredSeconds);
    return result({ adjustedSeconds, extraStops, noFailure });
  });
}
