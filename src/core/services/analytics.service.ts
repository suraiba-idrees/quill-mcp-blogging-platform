import {
  createEvent,
  getEventsForPost,
  getAnalyticsSummary,
  type AnalyticsSummary,
} from "../repositories/analytics.repository.js";
import { findPostById } from "../repositories/post.repository.js";
import { getAnalyticsSchema } from "../types/validation.js";
import { ServiceError } from "./errors.js";

// Recording a view represents a public visitor reading a published post —
// there is no "requesting user" to scope this to. Ownership enforcement
// happens on the read side (getPostAnalytics / getUserAnalytics) instead.
export function recordView(postId: string, referrer?: string | null): void {
  createEvent({ postId, eventType: "view", referrer: referrer ?? null });
}

export function getPostAnalytics(userId: string, postId: string, input: unknown = {}) {
  const parsed = getAnalyticsSchema.safeParse({ postId, ...(input as object) });
  if (!parsed.success) {
    throw new ServiceError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid analytics input"
    );
  }

  const post = findPostById(postId, userId);
  if (!post) throw new ServiceError("NOT_FOUND", "Post not found");

  const range = { rangeStart: parsed.data.rangeStart, rangeEnd: parsed.data.rangeEnd };

  const events = getEventsForPost(postId, userId, range);
  const summary = getAnalyticsSummary(userId, postId, range);

  return { postId, totalViews: summary.totalViews, events };
}

export function getUserAnalytics(userId: string, input: unknown = {}): AnalyticsSummary {
  const parsed = getAnalyticsSchema.safeParse(input);
  if (!parsed.success) {
    throw new ServiceError(
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid analytics input"
    );
  }

  return getAnalyticsSummary(userId, parsed.data.postId, {
    rangeStart: parsed.data.rangeStart,
    rangeEnd: parsed.data.rangeEnd,
  });
}