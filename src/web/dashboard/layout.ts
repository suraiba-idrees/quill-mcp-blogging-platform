export function dashboardLayout(
  title: string,
  content: string,
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title} | Quill</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f5f6f8;
            color: #1f2937;
          }

          .app {
            display: flex;
            min-height: 100vh;
          }

          .sidebar {
            width: 240px;
            background: #111827;
            color: white;
            padding: 24px 16px;
          }

          .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 32px;
          }

          .nav a {
            display: block;
            color: #d1d5db;
            text-decoration: none;
            padding: 10px 12px;
            border-radius: 6px;
            margin-bottom: 6px;
          }

          .nav a:hover {
            background: #1f2937;
            color: white;
          }

          .main {
            flex: 1;
            padding: 32px;
          }

          .page-header {
            margin-bottom: 24px;
          }

          .page-header h1 {
            margin: 0 0 8px;
            font-size: 28px;
          }

          .page-header p {
            margin: 0;
            color: #6b7280;
          }

          .card {
            background: white;
            border-radius: 8px;
            padding: 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          }

          .button {
            display: inline-block;
            padding: 10px 16px;
            background: #111827;
            color: white;
            text-decoration: none;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }

          .button:hover {
            background: #374151;
          }
        </style>
      </head>

      <body>
        <div class="app">
          <aside class="sidebar">
            <div class="logo">Quill</div>

            <nav class="nav">
              <a href="/dashboard">Posts</a>
              <a href="/dashboard/posts/new">New Post</a>
              <a href="/dashboard/analytics">Analytics</a>
              <a href="/dashboard/account">Account</a>
              <a href="/logout">Logout</a>
            </nav>
          </aside>

          <main class="main">
            ${content}
          </main>
        </div>
      </body>
    </html>
  `;
}