import { Hono } from "hono";

import { analyticsPage } from "./pages.js";

const analytics = new Hono();

analytics.get("/", (c) => {
  return c.html(analyticsPage());
});

export default analytics;