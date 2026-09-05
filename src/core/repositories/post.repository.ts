import { randomUUID } from "node:crypto";
import { getDb } from "../../database/connection.js";
import type { Post, PostStatus } from "../types/domain.js";

interface PostRow {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  content_md: string;
  status: PostStatus;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

function mapRow(row: PostRow): Post {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    slug: row.slug,
    contentMd: row.content_md,
    status: row.status,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    publishedAt: row.published_at,
    scheduledAt: row.scheduled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SELECT_COLUMNS = `
  id, user_id, title, slug, content_md, status,
  meta_title, meta_description, published_at, scheduled_at,
  created_at, updated_at
`;
const JOIN_SELECT_COLUMNS = `
  p.id, p.user_id, p.title, p.slug, p.content_md, p.status,
  p.meta_title, p.meta_description, p.published_at, p.scheduled_at,
  p.created_at, p.updated_at
`;

function toChangeCount(changes: number | bigint): number {
  return Number(changes);
}

export interface CreatePostRepoInput {
  userId: string;
  title: string;
  slug: string;
  contentMd: string;
}

export function createPost(input: CreatePostRepoInput): Post {
  const db = getDb();
  const id = randomUUID();

  db.prepare(
    `INSERT INTO posts (id, user_id, title, slug, content_md)
     VALUES (?, ?, ?, ?, ?)`
  ).run(id, input.userId, input.title, input.slug, input.contentMd);

  const row = db.prepare(`SELECT ${SELECT_COLUMNS} FROM posts WHERE id = ?`).get(id) as unknown as PostRow;
  return mapRow(row);
}

export function findPostById(id: string, userId: string): Post | null {
  const db = getDb();
  // Fixed: Cast through unknown
  const row = db
    .prepare(`SELECT ${SELECT_COLUMNS} FROM posts WHERE id = ? AND user_id = ?`)
    .get(id, userId) as unknown as PostRow | undefined;

  return row ? mapRow(row) : null;
}

export function findPostBySlug(userId: string, slug: string): Post | null {
  const db = getDb();
  // Fixed: Cast through unknown
  const row = db
    .prepare(`SELECT ${SELECT_COLUMNS} FROM posts WHERE user_id = ? AND slug = ?`)
    .get(userId, slug) as unknown as PostRow | undefined;

  return row ? mapRow(row) : null;
}

export function findPostsByUserId(userId: string, status?: PostStatus): Post[] {
  const db = getDb();

  if (status) {
    const rows = db
        .prepare(
            `SELECT ${SELECT_COLUMNS} FROM posts
         WHERE user_id = ? AND status = ?
         ORDER BY updated_at DESC`
        )
        .all(userId, status) as unknown as PostRow[];
    return rows.map(mapRow);
  }

  const rows = db
      .prepare(`SELECT ${SELECT_COLUMNS} FROM posts WHERE user_id = ? ORDER BY updated_at DESC`)
      .all(userId) as unknown as PostRow[];

  return rows.map(mapRow);
}

export interface UpdatePostRepoInput {
  title?: string;
  contentMd?: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export function updatePost(
  id: string,
  userId: string,
  updates: UpdatePostRepoInput
): Post | null {
  const db = getDb();

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.title !== undefined) {
    fields.push("title = ?");
    values.push(updates.title);
  }
  if (updates.contentMd !== undefined) {
    fields.push("content_md = ?");
    values.push(updates.contentMd);
  }
  if (updates.slug !== undefined) {
    fields.push("slug = ?");
    values.push(updates.slug);
  }
  if (updates.metaTitle !== undefined) {
    fields.push("meta_title = ?");
    values.push(updates.metaTitle);
  }
  if (updates.metaDescription !== undefined) {
    fields.push("meta_description = ?");
    values.push(updates.metaDescription);
  }

  if (fields.length === 0) {
    return findPostById(id, userId);
  }

  fields.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')");

  const sql = `UPDATE posts SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`;
  values.push(id, userId);

  const result = db.prepare(sql).run(...values);
  if (toChangeCount(result.changes) === 0) {
    return null;
  }

  return findPostById(id, userId);
}

export interface UpdatePostStatusRepoInput {
  status: PostStatus;
  publishedAt?: string | null;
  scheduledAt?: string | null;
}

export function updatePostStatus(
  id: string,
  userId: string,
  input: UpdatePostStatusRepoInput
): Post | null {
  const db = getDb();

  const fields = ["status = ?", "updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')"];
  const values: (string | number | null)[] = [input.status];

  if (input.publishedAt !== undefined) {
    fields.push("published_at = ?");
    values.push(input.publishedAt);
  }
  if (input.scheduledAt !== undefined) {
    fields.push("scheduled_at = ?");
    values.push(input.scheduledAt);
  }

  const sql = `UPDATE posts SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`;
  values.push(id, userId);

  const result = db.prepare(sql).run(...values);
  if (toChangeCount(result.changes) === 0) {
    return null;
  }

  return findPostById(id, userId);
}

export function deletePost(id: string, userId: string): boolean {
  const db = getDb();
  const result = db.prepare(`DELETE FROM posts WHERE id = ? AND user_id = ?`).run(id, userId);
  return toChangeCount(result.changes) > 0;
}

export function listPublishedPostsByUsername(username: string): Post[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT ${JOIN_SELECT_COLUMNS}
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE u.username = ? AND p.status = 'published'
       ORDER BY p.published_at DESC`
    )
    .all(username) as unknown as PostRow[];
  return rows.map(mapRow);
}

export function findPublishedPostByUsernameAndSlug(username: string, slug: string): Post | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT ${JOIN_SELECT_COLUMNS}
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE u.username = ? AND p.slug = ? AND p.status = 'published'
       LIMIT 1`
    )
    .get(username, slug) as PostRow | undefined;
  return row ? mapRow(row) : null;
}

export interface PublishedPostWithAuthor extends Post {
  authorUsername: string;
}

export function listAllPublishedPostsWithAuthor(): PublishedPostWithAuthor[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT ${JOIN_SELECT_COLUMNS}, u.username as author_username
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.status = 'published'
       ORDER BY p.published_at DESC`
    )
    .all() as unknown as (PostRow & { author_username: string })[];
  return rows.map((row) => ({ ...mapRow(row), authorUsername: row.author_username }));
}