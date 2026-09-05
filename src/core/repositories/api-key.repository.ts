import { randomUUID } from "node:crypto";
import { getDb } from "../../database/connection.js";
import type { ApiKey } from "../types/domain.js";

interface ApiKeyRow {
  id: string;
  user_id: string;
  key_hash: string;
  created_at: string;
  revoked_at: string | null;
}

function mapRow(row: ApiKeyRow): ApiKey {
  return {
    id: row.id,
    userId: row.user_id,
    keyHash: row.key_hash,
    createdAt: row.created_at,
    revokedAt: row.revoked_at,
  };
}

export interface CreateApiKeyRepoInput {
  userId: string;
  keyHash: string; // already hashed by the auth/API-key service
}

export function createApiKey(input: CreateApiKeyRepoInput): ApiKey {
  const db = getDb();
  const id = randomUUID();

  db.prepare(
    `INSERT INTO api_keys (id, user_id, key_hash) VALUES (?, ?, ?)`
  ).run(id, input.userId, input.keyHash);

  const row = db
      .prepare(
          `SELECT id, user_id, key_hash, created_at, revoked_at FROM api_keys WHERE id = ?`
      )
      .get(id) as unknown as ApiKeyRow;

  return mapRow(row);
}

export function findByKeyHash(keyHash: string): ApiKey | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, user_id, key_hash, created_at, revoked_at FROM api_keys WHERE key_hash = ?`
    )
    .get(keyHash) as unknown as ApiKeyRow | undefined;

  return row ? mapRow(row) : null;
}

export function revokeById(id: string): void {
  const db = getDb();
  db.prepare(
    `UPDATE api_keys
     SET revoked_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
     WHERE id = ? AND revoked_at IS NULL`
  ).run(id);
}

export function listActiveByUserId(userId: string): ApiKey[] {
  const db = getDb();
  const rows = db
      .prepare(
          `SELECT id, user_id, key_hash, created_at, revoked_at
       FROM api_keys
       WHERE user_id = ? AND revoked_at IS NULL
       ORDER BY created_at DESC`
      )
      .all(userId) as unknown as ApiKeyRow[];

  return rows.map(mapRow);
}