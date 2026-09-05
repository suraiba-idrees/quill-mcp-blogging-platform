import { Hono } from "hono";
import { analyticsPage } from "./pages.js";
import { sessionMiddleware } from "../../middleware/session.middleware.js";
import { listPosts } from "../../../core/services/post.service.js";
import { getUserAnalytics } from "../../../core/services/analytics.service.js";
import type { AuthedEnv } from "../../types.js";

const analytics = new Hono<AuthedEnv>();

analytics.use("*", sessionMiddleware);

analytics.get("/", (c) => {
  const userId = c.get("userId");
  const posts = listPosts(userId);
  const summary = getUserAnalytics(userId);
  return c.html(analyticsPage(posts, summary));
});

export default analytics;