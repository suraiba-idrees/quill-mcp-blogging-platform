import { Hono } from "hono";

import auth from "./auth/routes.js";
import dashboard from "./web/dashboard/routes.js";
import publicBlog from "./web/public-blog/routes.js";

const app = new Hono();

app.route("/auth", auth);
app.route("/dashboard", dashboard);
app.route("/blog", publicBlog);

app.get("/", (c) => {
  return c.redirect("/blog");
});

export default app;