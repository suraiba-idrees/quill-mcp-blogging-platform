import { Hono } from "hono";
import account from "./account/routes.js";
import analytics from "./analytics/routes.js";
import { dashboardPage } from "./pages.js";
import posts from "./posts/routes.js";
import { sessionMiddleware } from "../middleware/session.middleware.js";
import { listPosts } from "../../core/services/post.service.js";
import type { AuthedEnv } from "../types.js";

const dashboard = new Hono<AuthedEnv>();

dashboard.use("*", sessionMiddleware);

dashboard.get("/", (c) => {
  const userPosts = listPosts(c.get("userId"));
  return c.html(dashboardPage(userPosts));
});

dashboard.route("/posts", posts);
dashboard.route("/analytics", analytics);
dashboard.route("/account", account);

export default dashboard;