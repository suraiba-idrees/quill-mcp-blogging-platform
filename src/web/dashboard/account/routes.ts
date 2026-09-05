import { Hono } from "hono";
import { accountPage } from "./pages.js";
import { sessionMiddleware } from "../../middleware/session.middleware.js";
import { listActiveApiKeys, generateApiKey, revokeApiKey } from "../../../core/services/api-key.service.js";
import type { AuthedEnv } from "../../types.js";

const account = new Hono<AuthedEnv>();

account.use("*", sessionMiddleware);

account.get("/", (c) => {
  const keys = listActiveApiKeys(c.get("userId"));
  return c.html(accountPage(keys));
});

account.post("/api-keys", (c) => {
  const userId = c.get("userId");
  const generated = generateApiKey(userId);
  const keys = listActiveApiKeys(userId);
  return c.html(accountPage(keys, generated.rawKey));
});

account.post("/api-keys/:id/revoke", (c) => {
  const userId = c.get("userId");
  try {
    revokeApiKey(userId, c.req.param("id"));
  } catch {
    // Key already gone or not owned — ignore, just show current state
  }
  const keys = listActiveApiKeys(userId);
  return c.html(accountPage(keys));
});

export default account;