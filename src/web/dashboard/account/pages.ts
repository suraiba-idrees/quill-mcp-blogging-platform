import { dashboardLayout } from "../layout.js";
import { escapeHtml } from "../../lib/html-escape.js";

interface PublicApiKey {
  id: string;
  createdAt: string;
  revokedAt: string | null;
}

export function accountPage(apiKeys: PublicApiKey[], newRawKey?: string): string {
  const newKeyBanner = newRawKey
    ? `
      <div style="background:#dcfce7;color:#166534;padding:16px;border-radius:6px;margin-bottom:16px;">
        <strong>Your new API key (copy it now — it won't be shown again):</strong>
        <div style="font-family:monospace;background:white;padding:10px;border-radius:4px;margin-top:8px;word-break:break-all;">
          ${escapeHtml(newRawKey)}
        </div>
      </div>
    `
    : "";

  const keysList = apiKeys.length
    ? apiKeys
        .map(
          (key) => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #e5e7eb;">
          <div>
            <div>Key ID: ${escapeHtml(key.id.slice(0, 8))}...</div>
            <div style="color:#6b7280;font-size:13px;">Created: ${new Date(key.createdAt).toLocaleDateString()}</div>
          </div>
          <form method="POST" action="/dashboard/account/api-keys/${key.id}/revoke">
            <button class="button" type="submit" style="background:#991b1b;">Revoke</button>
          </form>
        </div>
      `,
        )
        .join("")
    : `
        <div style="padding: 16px; background: #f3f4f6; border-radius: 6px; margin-bottom: 16px;">
          <strong>No API keys available.</strong>
          <p style="margin-bottom: 0;">Create an API key to connect your MCP client.</p>
        </div>
      `;

  return dashboardLayout(
    "Account",
    `
      <div class="page-header">
        <h1>Account Settings</h1>
        <p>Manage your API keys.</p>
      </div>
      <div class="card">
        <h2>API Key Management</h2>
        <p>API keys are used to authenticate MCP requests.</p>
        ${newKeyBanner}
        ${keysList}
        <form method="POST" action="/dashboard/account/api-keys" style="margin-top:16px;">
          <button class="button" type="submit">Generate API Key</button>
        </form>
      </div>
    `,
  );
}