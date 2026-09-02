import { dashboardLayout } from "../layout.js";

export function accountPage(): string {
  return dashboardLayout(
    "Account",
    `
      <div class="page-header">
        <h1>Account Settings</h1>
        <p>Manage your account and API keys.</p>
      </div>

      <div class="card">
        <h2>Profile</h2>

        <form method="POST" action="/dashboard/account/profile">
          <label for="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Your name"
          />

          <label for="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
          />

          <button class="button" type="submit">
            Save Profile
          </button>
        </form>
      </div>

      <div class="card">
        <h2>API Key Management</h2>

        <p>
          API keys are used to authenticate MCP requests.
        </p>

        <div style="
          padding: 16px;
          background: #f3f4f6;
          border-radius: 6px;
          margin-bottom: 16px;
        ">
          <strong>No API keys available.</strong>
          <p style="margin-bottom: 0;">
            Create an API key to connect your MCP client.
          </p>
        </div>

        <button class="button" type="button">
          Generate API Key
        </button>
      </div>
    `,
  );
}