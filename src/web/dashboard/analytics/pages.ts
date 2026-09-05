import { dashboardLayout } from "../layout.js";
import { escapeHtml } from "../../lib/html-escape.js";
import type { Post } from "../../../core/types/domain.js";

interface AnalyticsSummary {
  totalViews: number;
  topPosts: { postId: string; title: string; views: number }[];
  referrers: { referrer: string; views: number }[];
}

export function analyticsPage(posts: Post[], summary: AnalyticsSummary): string {
  const published = posts.filter((p) => p.status === "published").length;
  const drafts = posts.filter((p) => p.status === "draft").length;
  const scheduled = posts.filter((p) => p.status === "scheduled").length;

  // Fix: Purana manual loop aur postsById lookup ab hat chuka hai kyunki title direct topPosts mein aa raha hai
  const performanceRows = summary.topPosts && summary.topPosts.length
    ? summary.topPosts
        .map((row) => {
          const title = row.title ? escapeHtml(row.title) : "(Untitled)";
          return `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;">
              <span>${title}</span>
              <span style="font-weight: 500;">${row.views} views</span>
            </div>
          `;
        })
        .join("")
    : `<p style="color: #6b7280;">No post views tracked yet.</p>`;

  // Extra: Real Referrers UI component for comprehensive analytics tracking
  const referrerRows = summary.referrers && summary.referrers.length
    ? summary.referrers
        .map((row) => {
          const source = row.referrer ? escapeHtml(row.referrer) : "Direct / Unknown";
          return `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;">
              <span>${source}</span>
              <span style="font-weight: 500;">${row.views} views</span>
            </div>
          `;
        })
        .join("")
    : `<p style="color: #6b7280;">No traffic sources detected yet.</p>`;

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
          <p style="font-size: 28px; font-weight: bold; margin: 8px 0 0 0;">${summary.totalViews}</p>
        </div>
        <div class="card">
          <h3>Published Posts</h3>
          <p style="font-size: 28px; font-weight: bold; margin: 8px 0 0 0;">${published}</p>
        </div>
        <div class="card">
          <h3>Drafts</h3>
          <p style="font-size: 28px; font-weight: bold; margin: 8px 0 0 0;">${drafts}</p>
        </div>
        <div class="card">
          <h3>Scheduled</h3>
          <p style="font-size: 28px; font-weight: bold; margin: 8px 0 0 0;">${scheduled}</p>
        </div>
      </div>

      <div style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      ">
        <div class="card">
          <h2>Top Performing Posts</h2>
          <div style="margin-top: 12px;">
            ${performanceRows}
          </div>
        </div>
        
        <div class="card">
          <h2>Traffic Sources (Referrers)</h2>
          <div style="margin-top: 12px;">
            ${referrerRows}
          </div>
        </div>
      </div>
    `,
  );
}
