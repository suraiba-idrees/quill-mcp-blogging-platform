import { Hono } from "hono";
import type { AuthedEnv } from "../types.js";
import { authRoutes } from "./auth.routes.js";
import { postRoutes } from "./post.routes.js";
import { analyticsRoutes } from "./analytics.routes.js";
import { apiKeyRoutes } from "./api-key.routes.js";

export const apiRoutes = new Hono<AuthedEnv>();

apiRoutes.route("/auth", authRoutes);
apiRoutes.route("/posts", postRoutes);
apiRoutes.route("/analytics", analyticsRoutes);
apiRoutes.route("/api-keys", apiKeyRoutes);