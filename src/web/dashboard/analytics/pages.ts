import { dashboardLayout } from "../layout.js";

export function analyticsPage(): string {
  return dashboardLayout(
    "Analytics",
    `
      <div class="page-header">
        <h1>Analytics</h1>
        <p>Track the performance of your blog.</p>
      </div>

      <div style="
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 24px;
      ">

        <div class="card">
          <h3>Total Views</h3>
          <p style="font-size: 28px; font-weight: bold;">0</p>
        </div>

        <div class="card">
          <h3>Published Posts</h3>
          <p style="font-size: 28px; font-weight: bold;">0</p>
        </div>

        <div class="card">
          <h3>Drafts</h3>
          <p style="font-size: 28px; font-weight: bold;">0</p>
        </div>

        <div class="card">
          <h3>Scheduled</h3>
          <p style="font-size: 28px; font-weight: bold;">0</p>
        </div>

      </div>

      <div class="card">
        <h2>Post Performance</h2>

        <p>
          Analytics data will appear here once your posts start
          receiving views.
        </p>
      </div>
    `,
  );
}