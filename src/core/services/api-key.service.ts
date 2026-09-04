import { randomBytes, createHash } from "node:crypto";
import {
  createApiKey as createApiKeyRepo,
  findByKeyHash,
  revokeById,
  listActiveByUserId,
} from "../repositories/api-key.repository.js";
import type { ApiKey } from "../types/domain.js";
import { ServiceError } from "./errors.js";

const KEY_PREFIX = "qk_live_";

export interface PublicApiKey {
  id: string;
  createdAt: string;
  revokedAt: string | null;
}

function toPublicApiKey(key: ApiKey): PublicApiKey {
  return { id: key.id, createdAt: key.createdAt, revokedAt: key.revokedAt };
}

function hashKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

export interface GeneratedApiKey {
  rawKey: string; // shown once at generation; never stored, logged, or returned again
  apiKey: PublicApiKey;
}

export function generateApiKey(userId: string): GeneratedApiKey {
  const secret = randomBytes(32).toString("base64url");
  const rawKey = `${KEY_PREFIX}${secret}`;
  const keyHash = hashKey(rawKey);

  const record = createApiKeyRepo({ userId, keyHash });

  return { rawKey, apiKey: toPublicApiKey(record) };
}

export interface ValidatedApiKey {
  apiKeyId: string;
  userId: string;
}

export function validateApiKey(rawKey: string): ValidatedApiKey {
  const keyHash = hashKey(rawKey);
  const record = findByKeyHash(keyHash);

  if (!record || record.revokedAt !== null) {
    throw new ServiceError("UNAUTHORIZED", "Invalid or revoked API key");
  }

  return { apiKeyId: record.id, userId: record.userId };
}

export function revokeApiKey(userId: string, apiKeyId: string): void {
  const owned = listActiveByUserId(userId).some((k) => k.id === apiKeyId);
  if (!owned) {
    throw new ServiceError("NOT_FOUND", "API key not found");
  }
  revokeById(apiKeyId);
}

export function listActiveApiKeys(userId: string): PublicApiKey[] {
  return listActiveByUserId(userId).map(toPublicApiKey);
}