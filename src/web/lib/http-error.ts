import type { Context } from "hono";
import { ServiceError, type ServiceErrorCode } from "../../core/services/errors.js";

const STATUS_MAP: Record<ServiceErrorCode, 400 | 401 | 404 | 409> = {
  VALIDATION_ERROR: 400,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
};

export function handleServiceError(c: Context, err: unknown) {
  if (err instanceof ServiceError) {
    return c.json({ error: err.message }, STATUS_MAP[err.code]);
  }
  console.error("Unexpected error:", err);
  return c.json({ error: "Internal server error" }, 500);
}