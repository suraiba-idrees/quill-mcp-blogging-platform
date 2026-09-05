import { escapeHtml } from "../web/lib/html-escape.js";
export function loginPage(error?: string): string {
  const errorHtml = error
    ? `<div style="background:#fee2e2;color:#991b1b;padding:10px 14px;border-radius:6px;margin-bottom:18px;font-size:14px;">${error}</div>`
    : "";
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Login | Quill</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
            background: #f5f6f8;
            color: #1f2937;
          }

          .auth-container {
            width: 100%;
            max-width: 420px;
            padding: 24px;
          }

          .auth-card {
            background: white;
            padding: 32px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }

          .logo {
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
          }

          .subtitle {
            text-align: center;
            color: #6b7280;
            margin-bottom: 28px;
          }

          .form-group {
            margin-bottom: 18px;
          }

          label {
            display: block;
            margin-bottom: 6px;
            font-weight: 600;
          }

          input {
            width: 100%;
            padding: 11px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 15px;
          }

          input:focus {
            outline: none;
            border-color: #111827;
          }

          .button {
            width: 100%;
            padding: 11px 16px;
            background: #111827;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 15px;
          }

          .button:hover {
            background: #374151;
          }

          .switch-auth {
            text-align: center;
            margin-top: 20px;
            color: #6b7280;
          }

          .switch-auth a {
            color: #111827;
            font-weight: 600;
            text-decoration: none;
          }
        </style>
      </head>

      <body>
        <div class="auth-container">
          <div class="auth-card">
            <div class="logo">Quill</div>
            <p class="subtitle">Sign in to your account</p>

            <form method="POST" action="/auth/login">
                          ${errorHtml}
              <div class="form-group">
                <label for="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div class="form-group">
                <label for="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Enter your password"
                />
              </div>

              <button class="button" type="submit">
                Login
              </button>
            </form>

            <div class="switch-auth">
              Don't have an account?
              <a href="/auth/signup">Create one</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function signupPage(error?: string, username?: string): string {
  const errorHtml = error
    ? `<div style="background:#fee2e2;color:#991b1b;padding:10px 14px;border-radius:6px;margin-bottom:18px;font-size:14px;">${error}</div>`
    : "";
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Sign Up | Quill</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
            background: #f5f6f8;
            color: #1f2937;
          }

          .auth-container {
            width: 100%;
            max-width: 420px;
            padding: 24px;
          }

          .auth-card {
            background: white;
            padding: 32px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }

          .logo {
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
          }

          .subtitle {
            text-align: center;
            color: #6b7280;
            margin-bottom: 28px;
          }

          .form-group {
            margin-bottom: 18px;
          }

          label {
            display: block;
            margin-bottom: 6px;
            font-weight: 600;
          }

          input {
            width: 100%;
            padding: 11px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 15px;
          }

          input:focus {
            outline: none;
            border-color: #111827;
          }

          .button {
            width: 100%;
            padding: 11px 16px;
            background: #111827;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 15px;
          }

          .button:hover {
            background: #374151;
          }

          .switch-auth {
            text-align: center;
            margin-top: 20px;
            color: #6b7280;
          }

          .switch-auth a {
            color: #111827;
            font-weight: 600;
            text-decoration: none;
          }
        </style>
      </head>

      <body>
        <div class="auth-container">
          <div class="auth-card">
            <div class="logo">Quill</div>
            <p class="subtitle">Create your account</p>

            <form method="POST" action="/auth/signup">
                          ${errorHtml}
              <div class="form-group">
                <label for="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Your name"
                />
              </div>

                            <div class="form-group">
                <label for="username">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  placeholder="your-username"
                  value="${escapeHtml(username ?? "")}"
                />
              </div>

              <div class="form-group">
                <label for="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                />
              </div>

              <div class="form-group">
                <label for="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Create a password"
                />
              </div>

              <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Confirm your password"
                />
              </div>

              <button class="button" type="submit">
                Create Account
              </button>
            </form>

            <div class="switch-auth">
              Already have an account?
              <a href="/auth/login">Login</a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}