export class McpToolError extends Error {
  constructor(
    message: string,
    readonly code: 'UNAUTHENTICATED' | 'INVALID_ARGUMENT' | 'NOT_FOUND' | 'CONFLICT' | 'UNAVAILABLE' | 'INTERNAL',
  ) {
    super(message);
    this.name = 'McpToolError';
  }
}

export function toMcpError(error: unknown): McpToolError {
  if (error instanceof McpToolError) return error;
  if (error instanceof Error && error.name === 'NotFoundError') return new McpToolError('The requested post was not found.', 'NOT_FOUND');
  if (error instanceof Error && error.name === 'ConflictError') return new McpToolError(error.message, 'CONFLICT');
  return new McpToolError('The requested operation could not be completed.', 'INTERNAL');
}