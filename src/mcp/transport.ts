import type { Context } from 'hono';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { authenticateRequest } from './auth.js';
import { McpToolError, toMcpError } from './errors.js';
import { createQuillMcpServer } from './server.js';
import type { ApiKeyResolver, McpAuditHook, QuillPostService } from './types.js';

interface Session {
  userId: string;
  transport: WebStandardStreamableHTTPServerTransport;
}

export interface McpHandlerOptions {
  service: QuillPostService;
  apiKeyResolver: ApiKeyResolver;
  audit?: McpAuditHook;
}

function errorResponse(error: unknown) {
  const safeError = toMcpError(error);
  const status = safeError.code === 'UNAUTHENTICATED' ? 401 : 500;
  return Response.json({ error: safeError.message, code: safeError.code }, { status });
}

export function createMcpHandler(options: McpHandlerOptions) {
  const sessions = new Map<string, Session>();

  return async (context: Context): Promise<Response> => {
    let identity;
    try {
      identity = await authenticateRequest(context.req.raw, options.apiKeyResolver);
    } catch (error) {
      return errorResponse(error);
    }

    const sessionId = context.req.header('mcp-session-id');
    if (sessionId) {
      const session = sessions.get(sessionId);
      if (!session) return Response.json({ error: 'The MCP session was not found.', code: 'NOT_FOUND' }, { status: 404 });
      if (session.userId !== identity.userId) return errorResponse(new McpToolError('The MCP session is not valid for this API key.', 'UNAUTHENTICATED'));
      const response = await session.transport.handleRequest(context.req.raw);
      if (context.req.method === 'DELETE') sessions.delete(sessionId);
      return response;
    }

    let transport: WebStandardStreamableHTTPServerTransport;
    transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
      onsessioninitialized: sessionId => {
        sessions.set(sessionId, { userId: identity.userId, transport });
      },
    });
    const server = createQuillMcpServer({ service: options.service, context: identity, audit: options.audit });
    await server.connect(transport);
    return transport.handleRequest(context.req.raw);
  };
}