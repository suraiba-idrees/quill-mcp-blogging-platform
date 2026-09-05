import { randomUUID } from "node:crypto";
import { getDb } from "../../database/connection.js";
import type { User } from "../types/domain.js";

interface UserRow {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  created_at: string;
}

function mapRow(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    passwordHash: row.password_hash,
    createdAt: row.created_at,
  };
}

const SELECT_COLUMNS = `id, email, username, password_hash, created_at`;

export interface CreateUserRepoInput {
  email: string;
  username: string;
  passwordHash: string;
}

export function createUser(input: CreateUserRepoInput): User {
  const db = getDb();
  const id = randomUUID();

  db.prepare(
    `INSERT INTO users (id, email, username, password_hash) VALUES (?, ?, ?, ?)`
  ).run(id, input.email, input.username, input.passwordHash);

  const row = db.prepare(`SELECT ${SELECT_COLUMNS} FROM users WHERE id = ?`).get(id) as unknown as UserRow;
  return mapRow(row);
}

export function findUserById(id: string): User | null {
  const db = getDb();
  // Fixed: Cast through unknown
  const row = db.prepare(`SELECT ${SELECT_COLUMNS} FROM users WHERE id = ?`).get(id) as
    | unknown

    | undefined as UserRow | undefined;
  return row ? mapRow(row) : null;
}

export function findUserByEmail(email: string): User | null {
  const db = getDb();
  const row = db.prepare(`SELECT ${SELECT_COLUMNS} FROM users WHERE email = ?`).get(email) as
    | unknown

    | undefined as UserRow | undefined;
  return row ? mapRow(row) : null;
}

export function findUserByUsername(username: string): User | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT ${SELECT_COLUMNS} FROM users WHERE username = ?`)
    .get(username) as unknown as UserRow | undefined;
  return row ? mapRow(row) : null;
}

export function existsByEmail(email: string): boolean {
  const db = getDb();
  const row = db.prepare(`SELECT 1 FROM users WHERE email = ? LIMIT 1`).get(email);
  return row !== undefined;
}

export function existsByUsername(username: string): boolean {
  const db = getDb();
  const row = db.prepare(`SELECT 1 FROM users WHERE username = ? LIMIT 1`).get(username);
  return row !== undefined;
}
