import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { loginPage, signupPage } from "./pages.js";
import { signup, login } from "../core/services/auth.service.js";
import { generateApiKey } from "../core/services/api-key.service.js";
import { ServiceError } from "../core/services/errors.js";

const auth = new Hono();

auth.get("/login", (c) => c.html(loginPage()));
auth.get("/signup", (c) => c.html(signupPage()));

auth.post("/login", async (c) => {
  const body = await c.req.parseBody();
  try {
    const user = login({ email: String(body.email), password: String(body.password) });
    const generated = generateApiKey(user.id);

    setCookie(c, "quill_session", generated.rawKey, {
      httpOnly: true,
      sameSite: "Lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return c.redirect("/dashboard");
  } catch (err) {
    if (err instanceof ServiceError) {
      return c.html(loginPage(err.message), 400);
    }
    return c.html(loginPage("Something went wrong. Please try again."), 500);
  }
});

auth.post("/signup", async (c) => {
  const body = await c.req.parseBody();
  const username = String(body.username ?? "");
  try {
    const user = signup({
      email: String(body.email),
      username,
      password: String(body.password),
    });
    const generated = generateApiKey(user.id);

    setCookie(c, "quill_session", generated.rawKey, {
      httpOnly: true,
      sameSite: "Lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return c.redirect("/dashboard");
  } catch (err) {
    if (err instanceof ServiceError) {
      return c.html(signupPage(err.message, username), 400);
    }
    return c.html(signupPage("Something went wrong. Please try again.", username), 500);
  }
});

export default auth;