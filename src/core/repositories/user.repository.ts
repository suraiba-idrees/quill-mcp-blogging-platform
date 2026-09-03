import { randomUUID } from "node:crypto";
import { getDb } from "../../database/connection.js";
import type { User } from "../types/domain.js";

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

function mapRow(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

export interface CreateUserRepoInput {
  email: string;
  passwordHash: string; // already hashed by the auth service — repo does not hash
}

export function createUser(input: CreateUserRepoInput): User {
  const db = getDb();
  const id = randomUUID();

  db.prepare(
    `INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)`
  ).run(id, input.email, input.passwordHash);

  const row = db
      .prepare(`SELECT id, email, password_hash, created_at FROM users WHERE id = ?`)
      .get(id) as unknown as UserRow;

  return mapRow(row);
}

export function findUserById(id: string): User | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT id, email, password_hash, created_at FROM users WHERE id = ?`)
    .get(id) as UserRow | undefined;

  return row ? mapRow(row) : null;
}

export function findUserByEmail(email: string): User | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT id, email, password_hash, created_at FROM users WHERE email = ?`)
    .get(email) as UserRow | undefined;

  return row ? mapRow(row) : null;
}

export function existsByEmail(email: string): boolean {
  const db = getDb();
  const row = db.prepare(`SELECT 1 FROM users WHERE email = ? LIMIT 1`).get(email);
  return row !== undefined;
}