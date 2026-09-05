// Shared domain types, mirroring src/database/migrations/001_initial.sql.
// Field names use camelCase; repositories map DB snake_case rows to these.

export type PostStatus = "draft" | "scheduled" | "published";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface ApiKey {
  id: string;
  userId: string;
  keyHash: string;
  createdAt: string;
  revokedAt: string | null;
}

export interface Post {
  id: string;
  userId: string;
  title: string;
  slug: string;
  contentMd: string;
  status: PostStatus;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsEvent {
  id: string;
  postId: string;
  eventType: string;
  referrer: string | null;
  occurredAt: string;
}

// --- Input types used by core services ---

export interface CreateUserInput {
  email: string;
  password: string; // raw password; service layer hashes it before storage
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreatePostInput {
  userId: string;
  title: string;
  contentMd?: string;
  slug?: string; // if omitted, service derives one from title
}

export interface UpdatePostInput {
  title?: string;
  contentMd?: string;
  slug?: string;
}

export interface PublishPostInput {
  id: string;
}

export interface SchedulePostInput {
  id: string;
  scheduledAt: string; // ISO 8601
}

export interface UnpublishPostInput {
  id: string;
}

export interface ManageSeoInput {
  id: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
}

export interface GetAnalyticsInput {
  postId?: string;
  rangeStart?: string;
  rangeEnd?: string;
}