import { randomUUID } from "node:crypto";
import { getDb } from "../../database/connection.js";
import type { AnalyticsEvent } from "../types/domain.js";

interface AnalyticsEventRow {
  id: string;
  post_id: string;
  event_type: string;
  referrer: string | null;
  occurred_at: string;
}

function mapRow(row: AnalyticsEventRow): AnalyticsEvent {
  return {
    id: row.id,
    postId: row.post_id,
    eventType: row.event_type,
    referrer: row.referrer,
    occurredAt: row.occurred_at,
  };
}

export interface CreateEventRepoInput {
  postId: string;
  eventType?: string;
  referrer?: string | null;
}

export function createEvent(input: CreateEventRepoInput): AnalyticsEvent {
  const db = getDb();
  const id = randomUUID();

  db.prepare(
    `INSERT INTO analytics_events (id, post_id, event_type, referrer)
     VALUES (?, ?, ?, ?)`
  ).run(id, input.postId, input.eventType ?? "view", input.referrer ?? null);

  const row = db
      .prepare(
          `SELECT id, post_id, event_type, referrer, occurred_at FROM analytics_events WHERE id = ?`
      )
      .get(id) as unknown as AnalyticsEventRow;

  return mapRow(row);
}

export interface DateRange {
  rangeStart?: string;
  rangeEnd?: string;
}

/**
 * analytics_events has no user_id column (Stage 1 decision). Ownership is
 * enforced here by joining through posts and filtering on posts.user_id —
 * this is the one place that join is guaranteed to happen.
 */
export function getEventsForPost(
  postId: string,
  userId: string,
  range: DateRange = {}
): AnalyticsEvent[] {
  const db = getDb();

  const conditions = ["ae.post_id = ?", "p.user_id = ?"];
  const values: (string | number)[] = [postId, userId];

  if (range.rangeStart) {
    conditions.push("ae.occurred_at >= ?");
    values.push(range.rangeStart);
  }
  if (range.rangeEnd) {
    conditions.push("ae.occurred_at <= ?");
    values.push(range.rangeEnd);
  }

  const sql = `
    SELECT ae.id, ae.post_id, ae.event_type, ae.referrer, ae.occurred_at
    FROM analytics_events ae
    JOIN posts p ON p.id = ae.post_id
    WHERE ${conditions.join(" AND ")}
    ORDER BY ae.occurred_at DESC
  `;

  const rows = db.prepare(sql).all(...values) as unknown as AnalyticsEventRow[];
  return rows.map(mapRow);
}

export interface AnalyticsSummary {
  totalViews: number;
  byPost: { postId: string; views: number }[];
}

/**
 * Aggregates a user's analytics, optionally narrowed to one post and/or a
 * date range. Always joins through posts — same ownership guarantee as above.
 */
export function getAnalyticsSummary(
  userId: string,
  postId?: string,
  range: DateRange = {}
): AnalyticsSummary {
  const db = getDb();

  const conditions = ["p.user_id = ?"];
  const values: (string | number)[] = [userId];

  if (postId) {
    conditions.push("ae.post_id = ?");
    values.push(postId);
  }
  if (range.rangeStart) {
    conditions.push("ae.occurred_at >= ?");
    values.push(range.rangeStart);
  }
  if (range.rangeEnd) {
    conditions.push("ae.occurred_at <= ?");
    values.push(range.rangeEnd);
  }

  const whereClause = conditions.join(" AND ");

  const totalRow = db
    .prepare(
      `SELECT COUNT(*) as count
       FROM analytics_events ae
       JOIN posts p ON p.id = ae.post_id
       WHERE ${whereClause}`
    )
    .get(...values) as { count: number };

  const byPostRows = db
    .prepare(
      `SELECT ae.post_id as postId, COUNT(*) as views
       FROM analytics_events ae
       JOIN posts p ON p.id = ae.post_id
       WHERE ${whereClause}
       GROUP BY ae.post_id
       ORDER BY views DESC`
    )
    .all(...values) as { postId: string; views: number }[];

  return { totalViews: totalRow.count, byPost: byPostRows };
}