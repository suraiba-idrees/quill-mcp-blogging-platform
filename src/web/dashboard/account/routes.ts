import { Hono } from "hono";

import { accountPage } from "./pages.js";

const account = new Hono();

account.get("/", (c) => {
  return c.html(accountPage());
});

export default account;