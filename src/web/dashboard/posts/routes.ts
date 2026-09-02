import { Hono } from "hono";

import { postEditorPage } from "./pages.js";

const posts = new Hono();

posts.get("/new", (c) => {
  return c.html(postEditorPage("create"));
});

posts.get("/edit", (c) => {
  return c.html(postEditorPage("edit"));
});

export default posts;