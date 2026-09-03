import { Hono } from "hono";

import { loginPage, signupPage } from "./pages.js";

const auth = new Hono();

auth.get("/login", (c) => {
  return c.html(loginPage());
});

auth.get("/signup", (c) => {
  return c.html(signupPage());
});

export default auth;