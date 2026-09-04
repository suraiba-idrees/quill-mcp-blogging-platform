/**
 * Quill application entry point.
 *
 * The single Node.js process bootstraps the web application,
 * MCP server, and shared application services from here.
 */

import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { runMigrations } from "./database/migrate.js";
import { apiRoutes } from "./web/routes/index.js";
import type { AuthedEnv } from "./web/types.js";

import auth from "./auth/routes.js";
import dashboard from "./web/dashboard/routes.js";
import publicBlog from "./web/public-blog/routes.js";

// Ensure schema is current on every boot — safe no-op if already applied.
runMigrations();

const app = new Hono<AuthedEnv>();

const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";
app.use("/api/*", cors({ origin: corsOrigin }));

app.get("/health", (c) => c.json({ status: "ok" }));
app.route("/api", apiRoutes);

app.route("/auth", auth);
app.route("/dashboard", dashboard);
app.route("/blog", publicBlog);

app.get("/", (c) => {
  return c.redirect("/blog");
});

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Quill server listening on port ${info.port}`);
});