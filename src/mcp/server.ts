import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerQuillTools } from './tools/index.js';
import type { McpAuditHook, McpRequestContext, QuillPostService } from './types.js';

export interface McpServerOptions {
  service: QuillPostService;
  context: McpRequestContext;
  audit?: McpAuditHook;
}

export function createQuillMcpServer(options: McpServerOptions) {
  const server = new McpServer(
    { name: 'quill', version: '1.0.0' },
    { capabilities: { tools: {} } },
  );
  registerQuillTools(server, options.context, options.service, options.audit);
  return server;
}