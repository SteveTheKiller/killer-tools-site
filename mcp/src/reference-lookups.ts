import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { ndrCategories } from '../../src/tools/exchange-ndr-lookup/exchange-ndr-lookup.constants';
import { policyCategories } from '../../src/tools/group-policy-reference/group-policy-reference.constants';
import { codesByCategories } from '../../src/tools/http-status-codes/http-status-codes.constants';
import { skusByCategory } from '../../src/tools/m365-sku-decoder/m365-sku-decoder.constants';
import { portCategories } from '../../src/tools/port-protocol-reference/port-protocol-reference.constants';
import { errorsByCategory } from '../../src/tools/windows-error-codes/windows-error-codes.constants';
import { eventsByCategory } from '../../src/tools/windows-event-lookup/windows-event-lookup.constants';

const querySchema = { query: z.string().trim().min(1).max(128), limit: z.number().int().min(1).max(20).default(10) };

function matches(query: string, ...values: (string | number)[]) {
  const needle = query.toLowerCase();
  return values.some(value => String(value).toLowerCase().includes(needle));
}

function result(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value) }] };
}

export function registerReferenceLookups(server: McpServer) {
  server.registerTool('lookup_exchange_ndr', {
    description: 'Search the Exchange non-delivery report reference shown on KillerTools.',
    inputSchema: querySchema,
  }, async ({ query, limit }) => result(ndrCategories.flatMap(group =>
    group.codes.filter(code => matches(query, code.code, code.name, code.description, code.cause, code.fix))
      .map(code => ({ category: group.category, ...code }))).slice(0, limit)));

  server.registerTool('lookup_group_policy', {
    description: 'Search the Group Policy reference shown on KillerTools.',
    inputSchema: querySchema,
  }, async ({ query, limit }) => result(policyCategories.flatMap(group =>
    group.policies.filter(policy => matches(query, policy.name, policy.path, policy.registry, policy.description))
      .map(policy => ({ category: group.category, ...policy }))).slice(0, limit)));

  server.registerTool('lookup_http_status', {
    description: 'Search the HTTP status code reference shown on KillerTools.',
    inputSchema: querySchema,
  }, async ({ query, limit }) => result(codesByCategories.flatMap(group =>
    group.codes.filter(code => matches(query, code.code, code.name, code.description))
      .map(code => ({ category: group.category, ...code }))).slice(0, limit)));

  server.registerTool('lookup_m365_sku', {
    description: 'Search the Microsoft 365 SKU reference shown on KillerTools.',
    inputSchema: querySchema,
  }, async ({ query, limit }) => result(skusByCategory.flatMap(group =>
    group.skus.filter(sku => matches(query, sku.guid, sku.stringId, sku.name, sku.description))
      .map(sku => ({ category: group.category, ...sku }))).slice(0, limit)));

  server.registerTool('lookup_port_protocol', {
    description: 'Search the port and protocol reference shown on KillerTools.',
    inputSchema: querySchema,
  }, async ({ query, limit }) => result(portCategories.flatMap(group =>
    group.ports.filter(port => matches(query, port.port, port.protocol, port.service, port.description))
      .map(port => ({ category: group.category, ...port }))).slice(0, limit)));

  server.registerTool('lookup_windows_error', {
    description: 'Search the Windows error code reference shown on KillerTools.',
    inputSchema: querySchema,
  }, async ({ query, limit }) => result(errorsByCategory.flatMap(group =>
    group.errors.filter(error => matches(query, error.decimal, error.hex, error.name, error.description))
      .map(error => ({ category: group.category, ...error }))).slice(0, limit)));

  server.registerTool('lookup_windows_event', {
    description: 'Search the Windows Event ID reference shown on KillerTools.',
    inputSchema: querySchema,
  }, async ({ query, limit }) => result(eventsByCategory.flatMap(group =>
    group.events.filter(event => matches(query, event.id, event.name, event.description))
      .map(event => ({ category: group.category, log: group.log, ...event }))).slice(0, limit)));
}
