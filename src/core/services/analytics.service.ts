import {
  createEvent,
  getEventsForPost,
  getAnalyticsSummary,
  getReferrerBreakdown,
  getTopPostsWithTitles,
  type AnalyticsSummary,
  type ReferrerBreakdown,
  type TopPost,
} from "../repositories/analytics.repository.js";
import { findPostById } from "../repositories/post.repository.js";
import { getAnalyticsSchema } from "../types/validation.js";
import { ServiceError } from "./errors.js";

export function recordView(postId: string, referrer?: string | null): void {
  createEvent({ postId, eventType: "view", referrer: referrer ?? null });
}

export interface PostAnalyticsResult {
  postId: string;
  totalViews: number;
  referrers: ReferrerBreakdown[];
  events: ReturnType<typeof getEventsForPost>;
}

export function getPostAnalytics(userId: string, postId: string, input: unknown = {}): PostAnalyticsResult {
  const parsed = getAnalyticsSchema.safeParse({ postId, ...(input as object) });
  if (!parsed.success) {
    throw new ServiceError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid analytics input");
  }

  const post = findPostById(postId, userId);
  if (!post) throw new ServiceError("NOT_FOUND", "Post not found");

  const range = { rangeStart: parsed.data.rangeStart, rangeEnd: parsed.data.rangeEnd };

  const events = getEventsForPost(postId, userId, range);
  const summary = getAnalyticsSummary(userId, postId, range);
  const referrers = getReferrerBreakdown(userId, postId, range);

  return { postId, totalViews: summary.totalViews, referrers, events };
}

export interface UserAnalyticsResult extends AnalyticsSummary {
  referrers: ReferrerBreakdown[];
  topPosts: TopPost[];
}

export function getUserAnalytics(userId: string, input: unknown = {}): UserAnalyticsResult {
  const parsed = getAnalyticsSchema.safeParse(input);
  if (!parsed.success) {
    throw new ServiceError("VALIDATION_ERROR", parsed.error.issues[0]?.message ?? "Invalid analytics input");
  }

  const range = { rangeStart: parsed.data.rangeStart, rangeEnd: parsed.data.rangeEnd };

  const summary = getAnalyticsSummary(userId, parsed.data.postId, range);
  const referrers = getReferrerBreakdown(userId, parsed.data.postId, range);
  const topPosts = getTopPostsWithTitles(userId, range);

  return { ...summary, referrers, topPosts };
}