import { dashboardLayout } from "./layout.js";

export function dashboardPage(): string {
  return dashboardLayout(
    "Dashboard",
    `
      <div class="page-header">
        <h1>Posts</h1>
        <p>Manage your blog posts.</p>
      </div>

      <div class="card">
        <p>You don't have any posts yet.</p>

        <a class="button" href="/dashboard/posts/new">
          Create your first post
        </a>
      </div>
    `,
  );
}