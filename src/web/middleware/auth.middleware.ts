import type { MiddlewareHandler } from "hono";
import { validateApiKey } from "../../core/services/api-key.service.js";
import type { AuthedEnv } from "../types.js";

export const authMiddleware: MiddlewareHandler<AuthedEnv> = async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const rawKey = header.slice("Bearer ".length).trim();
  if (!rawKey) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { userId, apiKeyId } = validateApiKey(rawKey);
    c.set("userId", userId);
    c.set("apiKeyId", apiKeyId);
    await next();
  } catch {
    // Never expose whether the key was malformed, unknown, or revoked.
    return c.json({ error: "Unauthorized" }, 401);
  }
};