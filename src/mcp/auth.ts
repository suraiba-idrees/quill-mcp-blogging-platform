import { McpToolError } from './errors.js';
import type { ApiKeyResolver } from './types.js';

export async function authenticateRequest(request: Request, resolver: ApiKeyResolver) {
  const authorization = request.headers.get('authorization');
  const apiKey = authorization?.match(/^Bearer\s+(.+)$/i)?.[1] ?? request.headers.get('x-api-key');
  if (!apiKey) throw new McpToolError('Authentication is required.', 'UNAUTHENTICATED');
  const identity = await resolver.resolve(apiKey);
  if (!identity?.userId) throw new McpToolError('The supplied API key is invalid.', 'UNAUTHENTICATED');
  return { userId: identity.userId };
}