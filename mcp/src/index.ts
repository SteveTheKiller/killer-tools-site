import { McpServer } from '@modelcontextprotocol/server';
import { createMcpHandler } from 'agents/mcp/server';
import { z } from 'zod';
import { convertCase } from '../../src/tools/case-converter/case-converter.models';
import { convertAsciiBinaryToText, convertTextToAsciiBinary } from '../../src/tools/text-to-binary/text-to-binary.models';
import { base64ToText, textToBase64 } from '../../src/utils/base64';

const inputText = z.string().max(4096);
const maxRequestBytes = 65536;

interface Env {
  REQUEST_LIMITER: {
    limit(options: { key: string }): Promise<{ success: boolean }>;
  };
}

function result(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value) }] };
}

async function boundedRequest(request: Request): Promise<Request | Response> {
  if (request.method !== 'POST' || !request.body) {
    return request;
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    size += value.byteLength;
    if (size > maxRequestBytes) {
      await reader.cancel();
      return new Response('Request too large', { status: 413 });
    }
    chunks.push(value);
  }

  const body = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const headers = new Headers(request.headers);
  headers.delete('content-length');
  return new Request(request, { body, headers });
}

function createServer() {
  const server = new McpServer({ name: 'KillerTools MCP', version: '0.1.0' });

  server.registerTool('convert_case', {
    description: 'Return the case conversions shown by the KillerTools Case Converter.',
    inputSchema: { text: inputText },
  }, async ({ text }) => result(convertCase(text)));

  server.registerTool('encode_base64', {
    description: 'Encode text as standard or URL-safe Base64 using the KillerTools converter.',
    inputSchema: { text: inputText, urlSafe: z.boolean().optional() },
  }, async ({ text, urlSafe }) => result({ encoded: textToBase64(text, { makeUrlSafe: urlSafe }) }));

  server.registerTool('decode_base64', {
    description: 'Decode a standard or URL-safe Base64 string using the KillerTools converter.',
    inputSchema: { encoded: inputText, urlSafe: z.boolean().optional() },
  }, async ({ encoded, urlSafe }) => {
    try {
      return result({ text: base64ToText(encoded, { makeUrlSafe: urlSafe }) });
    }
    catch {
      return { content: [{ type: 'text' as const, text: 'Invalid Base64 input' }], isError: true };
    }
  });

  server.registerTool('text_to_ascii_binary', {
    description: 'Convert text to the binary representation shown by the KillerTools Text to Binary tool.',
    inputSchema: { text: inputText },
  }, async ({ text }) => result({ binary: convertTextToAsciiBinary(text) }));

  server.registerTool('ascii_binary_to_text', {
    description: 'Convert ASCII binary bytes to text using the KillerTools Text to Binary tool.',
    inputSchema: { binary: inputText },
  }, async ({ binary }) => {
    try {
      return result({ text: convertAsciiBinaryToText(binary) });
    }
    catch {
      return { content: [{ type: 'text' as const, text: 'Invalid binary input' }], isError: true };
    }
  });

  return server;
}

const handler = createMcpHandler(createServer, {
  allowedHostnames: ['localhost', '127.0.0.1', 'mcp.killertools.net'],
  allowedOriginHostnames: ['localhost', '127.0.0.1', 'mcp.killertools.net'],
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    if (new URL(request.url).pathname !== '/mcp') {
      return new Response('Not found', { status: 404 });
    }
    if (Number(request.headers.get('content-length')) > maxRequestBytes) {
      return new Response('Request too large', { status: 413 });
    }
    const key = request.headers.get('cf-connecting-ip') || 'local';
    const { success } = await env.REQUEST_LIMITER.limit({ key });
    if (!success) {
      return new Response('Rate limit exceeded', { status: 429 });
    }
    const bounded = await boundedRequest(request);
    if (bounded instanceof Response) {
      return bounded;
    }
    return handler(bounded, env, ctx);
  },
};
