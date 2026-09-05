import { escapeHtml } from "../lib/html-escape.js";
import type { Post } from "../../core/types/domain.js";
import type { PublishedPostWithAuthor } from "../../core/repositories/post.repository.js";

export function publicDirectoryPage(posts: PublishedPostWithAuthor[]): string {
  const postCards = posts.length
    ? posts
        .map(
          (post) => `
        <article class="post-card">
          <h2>
            <a href="/blog/${post.authorUsername}/${post.slug}">${escapeHtml(post.title)}</a>
          </h2>
          <p class="date">by ${escapeHtml(post.authorUsername)} · ${new Date(post.publishedAt ?? post.createdAt).toLocaleDateString()}</p>
          <p>${escapeHtml(post.metaDescription ?? post.contentMd.slice(0, 150))}</p>
          <a class="read-more" href="/blog/${post.authorUsername}/${post.slug}">Read more →</a>
        </article>
      `,
        )
        .join("")
    : `<p>No posts published yet. Check back soon.</p>`;

  return baseLayout("Quill Blog", "Read the latest published posts.", postCards);
}

export function userBlogPage(username: string, posts: Post[]): string {
  const postCards = posts.length
    ? posts
        .map(
          (post) => `
        <article class="post-card">
          <h2>
            <a href="/blog/${username}/${post.slug}">${escapeHtml(post.title)}</a>
          </h2>
          <p class="date">${new Date(post.publishedAt ?? post.createdAt).toLocaleDateString()}</p>
          <p>${escapeHtml(post.metaDescription ?? post.contentMd.slice(0, 150))}</p>
          <a class="read-more" href="/blog/${username}/${post.slug}">Read more →</a>
        </article>
      `,
        )
        .join("")
    : `<p>This user hasn't published any posts yet.</p>`;

  return baseLayout(`${username} · Quill Blog`, `Posts by ${escapeHtml(username)}`, postCards);
}

function baseLayout(title: string, subtitle: string, postCards: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(title)}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; font-family: Arial, sans-serif; background: #f5f6f8; color: #1f2937; }
          .header { background: #111827; color: white; padding: 24px 40px; }
          .header-content { max-width: 1000px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
          .logo { font-size: 24px; font-weight: bold; }
          .header a { color: white; text-decoration: none; }
          .container { max-width: 1000px; margin: 40px auto; padding: 0 20px; }
          .intro { margin-bottom: 32px; }
          .intro h1 { margin-bottom: 8px; font-size: 36px; }
          .intro p { color: #6b7280; }
          .posts { display: grid; gap: 20px; }
          .post-card { background: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
          .post-card h2 { margin-top: 0; margin-bottom: 8px; }
          .post-card h2 a { color: #111827; text-decoration: none; }
          .post-card h2 a:hover { text-decoration: underline; }
          .date { color: #6b7280; font-size: 14px; }
          .read-more { color: #111827; font-weight: bold; text-decoration: none; }
          .read-more:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <header class="header">
          <div class="header-content">
            <a class="logo" href="/blog">Quill</a>
            <a href="/auth/login">Login</a>
          </div>
        </header>
        <main class="container">
          <section class="intro">
            <h1>${escapeHtml(title)}</h1>
            <p>${subtitle}</p>
          </section>
          <section class="posts">${postCards}</section>
        </main>
      </body>
    </html>
  `;
}

export function publicPostPage(post: Post, username: string): string {
  const dateStr = new Date(post.publishedAt ?? post.createdAt).toLocaleDateString();
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${escapeHtml(post.metaTitle ?? post.title)} | Quill</title>
        ${post.metaDescription ? `<meta name="description" content="${escapeHtml(post.metaDescription)}" />` : ""}
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; font-family: Arial, sans-serif; background: #f5f6f8; color: #1f2937; }
          .header { background: #111827; color: white; padding: 24px 40px; }
          .header-content { max-width: 800px; margin: 0 auto; }
          .header a { color: white; text-decoration: none; }
          .container { max-width: 800px; margin: 40px auto; padding: 0 20px; }
          .post { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
          .post h1 { margin-top: 0; font-size: 40px; }
          .date { color: #6b7280; margin-bottom: 32px; }
          .content { line-height: 1.8; white-space: pre-wrap; }
          .back { display: inline-block; margin-bottom: 20px; color: #111827; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <header class="header">
          <div class="header-content"><a href="/blog">← Back to Quill Blog</a></div>
        </header>
        <main class="container">
          <a class="back" href="/blog/${username}">← ${escapeHtml(username)}'s posts</a>
          <article class="post">
            <h1>${escapeHtml(post.title)}</h1>
            <p class="date">${dateStr}</p>
            <div class="content">${escapeHtml(post.contentMd)}</div>
          </article>
        </main>
      </body>
    </html>
  `;
}