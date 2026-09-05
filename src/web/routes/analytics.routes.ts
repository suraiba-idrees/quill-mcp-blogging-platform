import { Hono } from "hono";
import type { AuthedEnv } from "../types.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import * as analyticsService from "../../core/services/analytics.service.js";
import { handleServiceError } from "../lib/http-error.js";

export const analyticsRoutes = new Hono<AuthedEnv>();

analyticsRoutes.use("*", authMiddleware);

analyticsRoutes.post("/posts/:id/view", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}) as { referrer?: string });
    analyticsService.recordView(c.req.param("id"), body.referrer ?? null);
    return c.body(null, 204);
  } catch (err) {
    return handleServiceError(c, err);
  }
});

analyticsRoutes.get("/posts/:id", (c) => {
  try {
    const result = analyticsService.getPostAnalytics(c.get("userId"), c.req.param("id"), {
      rangeStart: c.req.query("rangeStart"),
      rangeEnd: c.req.query("rangeEnd"),
    });
    return c.json(result);
  } catch (err) {
    return handleServiceError(c, err);
  }
});

analyticsRoutes.get("/", (c) => {
  try {
    const result = analyticsService.getUserAnalytics(c.get("userId"), {
      postId: c.req.query("postId"),
      rangeStart: c.req.query("rangeStart"),
      rangeEnd: c.req.query("rangeEnd"),
    });
    return c.json(result);
  } catch (err) {
    return handleServiceError(c, err);
  }
});