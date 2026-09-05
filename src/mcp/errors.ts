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

  // ServiceError uses a .code property, not distinct error.name values.
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: string }).code;
    const message = error instanceof Error ? error.message : "An error occurred";
    if (code === "NOT_FOUND") return new McpToolError(message, "NOT_FOUND");
    if (code === "CONFLICT") return new McpToolError(message, "CONFLICT");
    if (code === "VALIDATION_ERROR" || code === "BAD_REQUEST") return new McpToolError(message, "INVALID_ARGUMENT");
    if (code === "UNAUTHORIZED") return new McpToolError(message, "UNAUTHENTICATED");
  }

  return new McpToolError('The requested operation could not be completed.', 'INTERNAL');
}