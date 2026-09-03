import { Hono } from "hono";
import type { AuthedEnv } from "../types.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import * as apiKeyService from "../../core/services/api-key.service.js";
import { handleServiceError } from "../lib/http-error.js";

export const apiKeyRoutes = new Hono<AuthedEnv>();

apiKeyRoutes.use("*", authMiddleware);

apiKeyRoutes.post("/", (c) => {
  try {
    const generated = apiKeyService.generateApiKey(c.get("userId"));
    return c.json({ apiKey: generated.rawKey, record: generated.apiKey }, 201);
  } catch (err) {
    return handleServiceError(c, err);
  }
});

apiKeyRoutes.get("/", (c) => {
  try {
    const apiKeys = apiKeyService.listActiveApiKeys(c.get("userId"));
    return c.json({ apiKeys });
  } catch (err) {
    return handleServiceError(c, err);
  }
});

apiKeyRoutes.delete("/:id", (c) => {
  try {
    apiKeyService.revokeApiKey(c.get("userId"), c.req.param("id"));
    return c.body(null, 204);
  } catch (err) {
    return handleServiceError(c, err);
  }
});