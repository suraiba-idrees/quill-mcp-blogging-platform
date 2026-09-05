import { Hono } from "hono";
import { publicDirectoryPage, userBlogPage, publicPostPage } from "./pages.js";
import {
  listAllPublishedPosts,
  listPublishedPostsByUsername,
  getPublishedPostByUsernameAndSlug,
} from "../../core/services/post.service.js";

const publicBlog = new Hono();

publicBlog.get("/", (c) => {
  const posts = listAllPublishedPosts();
  return c.html(publicDirectoryPage(posts));
});

publicBlog.get("/:username", (c) => {
  const username = c.req.param("username");
  const posts = listPublishedPostsByUsername(username);
  return c.html(userBlogPage(username, posts));
});

publicBlog.get("/:username/:slug", (c) => {
  const { username, slug } = c.req.param();
  try {
    const post = getPublishedPostByUsernameAndSlug(username, slug);
    return c.html(publicPostPage(post, username));
  } catch {
    return c.notFound();
  }
});

export default publicBlog;