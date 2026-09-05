import { Hono } from "hono";
import { signup, login } from "../../core/services/auth.service.js";
import { generateApiKey } from "../../core/services/api-key.service.js";
import { handleServiceError } from "../lib/http-error.js";

export const authRoutes = new Hono();

authRoutes.post("/signup", async (c) => {
  try {
    const body = await c.req.json();
    const user = signup(body);
    return c.json({ user }, 201);
  } catch (err) {
    return handleServiceError(c, err);
  }
});

authRoutes.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const user = login(body);
    const generated = generateApiKey(user.id);
    // rawKey is returned exactly once — never stored, never logged.
    return c.json({ user, apiKey: generated.rawKey });
  } catch (err) {
    return handleServiceError(c, err);
  }
});