import { Hono } from "hono";

import account from "./account/routes.js";
import analytics from "./analytics/routes.js";
import { dashboardPage } from "./pages.js";
import posts from "./posts/routes.js";

const dashboard = new Hono();

dashboard.get("/", (c) => {
  return c.html(dashboardPage());
});

dashboard.route("/posts", posts);
dashboard.route("/analytics", analytics);
dashboard.route("/account", account);

export default dashboard;