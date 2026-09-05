import {
  createPost as createPostRepo,
  findPostById,
  findPostsByUserId,
  findPostBySlug,
  updatePost as updatePostRepo,
  deletePost as deletePostRepo,
  updatePostStatus as updatePostStatusRepo,
  listPublishedPostsByUsername as listPublishedPostsByUsernameRepo,
  findPublishedPostByUsernameAndSlug as findPublishedPostByUsernameAndSlugRepo,
  listAllPublishedPostsWithAuthor as listAllPublishedPostsWithAuthorRepo,
  type PublishedPostWithAuthor,
} from "../repositories/post.repository.js";
import {
  createPostSchema,
  updatePostSchema,
  schedulePostSchema,
  manageSeoSchema,
} from "../types/validation.js";
import type { Post, PostStatus } from "../types/domain.js";
import { ServiceError } from "./errors.js";

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "post";
}

function ensureUniqueSlug(userId: string, baseSlug: string, excludePostId?: string): string {
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const existing = findPostBySlug(userId, slug);
    if (!existing || existing.id === excludePostId) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export function createPost(userId: string, input: unknown): Post {
  const parsed = createPostSchema.safeParse(input);
  if (!parsed.success) {
    throw new ServiceError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid post input"
    );
  }

  const baseSlug = slugify(parsed.data.slug ?? parsed.data.title);
  const slug = ensureUniqueSlug(userId, baseSlug);

  return createPostRepo({
    userId,
    title: parsed.data.title,
    slug,
    contentMd: parsed.data.contentMd ?? "",
  });
}

export function getPost(userId: string, postId: string): Post {
  const post = findPostById(postId, userId);
  if (!post) throw new ServiceError("NOT_FOUND", "Post not found");
  return post;
}

export function listPosts(userId: string, status?: PostStatus): Post[] {
  return findPostsByUserId(userId, status);
}

export function updatePost(userId: string, postId: string, input: unknown): Post {
  const parsed = updatePostSchema.safeParse(input);
  if (!parsed.success) {
    throw new ServiceError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid post input"
    );
  }

  const existing = findPostById(postId, userId);
  if (!existing) throw new ServiceError("NOT_FOUND", "Post not found");

  let slug: string | undefined;
  if (parsed.data.slug !== undefined) {
    slug = ensureUniqueSlug(userId, slugify(parsed.data.slug), postId);
  }

  const updated = updatePostRepo(postId, userId, {
    title: parsed.data.title,
    contentMd: parsed.data.contentMd,
    slug,
  });

  if (!updated) throw new ServiceError("NOT_FOUND", "Post not found");
  return updated;
}

export function deletePost(userId: string, postId: string): void {
  const deleted = deletePostRepo(postId, userId);
  if (!deleted) throw new ServiceError("NOT_FOUND", "Post not found");
}

export function publishPost(userId: string, postId: string): Post {
  const existing = findPostById(postId, userId);
  if (!existing) throw new ServiceError("NOT_FOUND", "Post not found");

  const updated = updatePostStatusRepo(postId, userId, {
    status: "published",
    publishedAt: new Date().toISOString(),
    scheduledAt: null,
  });

  if (!updated) throw new ServiceError("NOT_FOUND", "Post not found");
  return updated;
}

export function schedulePost(
  userId: string,
  postId: string,
  input: { scheduledAt: string }
): Post {
  const parsed = schedulePostSchema.safeParse({ id: postId, scheduledAt: input.scheduledAt });
  if (!parsed.success) {
    throw new ServiceError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid schedule input"
    );
  }

  const existing = findPostById(postId, userId);
  if (!existing) throw new ServiceError("NOT_FOUND", "Post not found");

  if (new Date(parsed.data.scheduledAt).getTime() <= Date.now()) {
    throw new ServiceError("BAD_REQUEST", "scheduledAt must be in the future");
  }

  const updated = updatePostStatusRepo(postId, userId, {
    status: "scheduled",
    scheduledAt: parsed.data.scheduledAt,
    publishedAt: null,
  });

  if (!updated) throw new ServiceError("NOT_FOUND", "Post not found");
  return updated;
}

export function unpublishPost(userId: string, postId: string): Post {
  const existing = findPostById(postId, userId);
  if (!existing) throw new ServiceError("NOT_FOUND", "Post not found");

  const updated = updatePostStatusRepo(postId, userId, {
    status: "draft",
    publishedAt: null,
    scheduledAt: null,
  });

  if (!updated) throw new ServiceError("NOT_FOUND", "Post not found");
  return updated;
}

export function updateSeo(
  userId: string,
  postId: string,
  input: { metaTitle?: string; metaDescription?: string; slug?: string }
): Post {
  const parsed = manageSeoSchema.safeParse({ id: postId, ...input });
  if (!parsed.success) {
    throw new ServiceError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid SEO input"
    );
  }

  const existing = findPostById(postId, userId);
  if (!existing) throw new ServiceError("NOT_FOUND", "Post not found");

  let slug: string | undefined;
  if (parsed.data.slug !== undefined) {
    slug = ensureUniqueSlug(userId, slugify(parsed.data.slug), postId);
  }

  const updated = updatePostRepo(postId, userId, {
    metaTitle: parsed.data.metaTitle,
    metaDescription: parsed.data.metaDescription,
    slug,
  });

  if (!updated) throw new ServiceError("NOT_FOUND", "Post not found");
  return updated;
}
export function listPublishedPostsByUsername(username: string): Post[] {
  return listPublishedPostsByUsernameRepo(username);
}

export function getPublishedPostByUsernameAndSlug(username: string, slug: string): Post {
  const post = findPublishedPostByUsernameAndSlugRepo(username, slug);
  if (!post) throw new ServiceError("NOT_FOUND", "Post not found");
  return post;
}

export function listAllPublishedPosts(): PublishedPostWithAuthor[] {
  return listAllPublishedPostsWithAuthorRepo();
}