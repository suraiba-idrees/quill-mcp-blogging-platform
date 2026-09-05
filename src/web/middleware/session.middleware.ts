import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { validateApiKey } from "../../core/services/api-key.service.js";
import type { AuthedEnv } from "../types.js";

export const sessionMiddleware: MiddlewareHandler<AuthedEnv> = async (c, next) => {
  const apiKey = getCookie(c, "quill_session");

  if (!apiKey) {
    return c.redirect("/auth/login");
  }

  try {
    const { userId, apiKeyId } = validateApiKey(apiKey);
    c.set("userId", userId);
    c.set("apiKeyId", apiKeyId);
    await next();
  } catch {
    return c.redirect("/auth/login");
  }
};