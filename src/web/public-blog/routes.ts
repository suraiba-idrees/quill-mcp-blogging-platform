import { Hono } from "hono";

import {
  publicBlogPage,
  publicPostPage,
} from "./pages.js";

const publicBlog = new Hono();

publicBlog.get("/", (c) => {
  return c.html(publicBlogPage());
});

publicBlog.get("/post/:slug", (c) => {
  const slug = c.req.param("slug");

  return c.html(
    publicPostPage(
      "Welcome to Quill",
      "This is an example published post.\n\nThe real post content will be loaded from the database once the backend is implemented.",
      "September 2, 2026",
    ),
  );
});

export default publicBlog;