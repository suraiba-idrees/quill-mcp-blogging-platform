import { dashboardLayout } from "../layout.js";

export function postEditorPage(
  mode: "create" | "edit" = "create",
): string {
  const isEdit = mode === "edit";

  return dashboardLayout(
    isEdit ? "Edit Post" : "New Post",
    `
      <div class="page-header">
        <h1>${isEdit ? "Edit Post" : "Create New Post"}</h1>
        <p>
          ${isEdit
            ? "Update your blog post and its publishing settings."
            : "Write and configure your new blog post."}
        </p>
      </div>

      <form method="POST" action="${isEdit ? "/dashboard/posts/edit" : "/dashboard/posts"}">

        <div class="card">
          <h2>Post Content</h2>

          <label for="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Enter post title"
            required
          />

          <label for="content">Markdown Content</label>
          <textarea
            id="content"
            name="content"
            rows="18"
            placeholder="# Write your post in Markdown..."
            required
          ></textarea>

          <label for="tags">Tags</label>
          <input
            id="tags"
            name="tags"
            type="text"
            placeholder="technology, programming, AI"
          />
        </div>

        <div class="card">
          <h2>Publishing</h2>

          <label for="status">Status</label>
          <select id="status" name="status">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>

          <label for="publishAt">Schedule Date & Time</label>
          <input
            id="publishAt"
            name="publishAt"
            type="datetime-local"
          />

          <div style="margin-top: 20px;">
            <button class="button" type="submit">
              ${isEdit ? "Save Changes" : "Create Post"}
            </button>

            ${
              isEdit
                ? `
                  <button
                    class="button"
                    type="button"
                    style="margin-left: 8px;"
                  >
                    Unpublish
                  </button>
                `
                : ""
            }
          </div>
        </div>

        <div class="card">
          <h2>SEO</h2>

          <label for="seoTitle">SEO Title</label>
          <input
            id="seoTitle"
            name="seoTitle"
            type="text"
            placeholder="SEO title"
          />

          <label for="seoDescription">Meta Description</label>
          <textarea
            id="seoDescription"
            name="seoDescription"
            rows="4"
            placeholder="Write a short description for search engines..."
          ></textarea>

          <label for="slug">URL Slug</label>
          <input
            id="slug"
            name="slug"
            type="text"
            placeholder="my-blog-post"
          />
        </div>

      </form>
    `,
  );
}