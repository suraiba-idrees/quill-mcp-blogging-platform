// src/database/connection.ts

import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

let db: DatabaseSync | null = null;

function resolveDatabasePath(): string {
  return process.env.DATABASE_PATH || "./data/quill.db";
}

export function getDb(): DatabaseSync {
  if (db) {
    return db;
  }

  const path = resolveDatabasePath();

  mkdirSync(dirname(path), { recursive: true });

  db = new DatabaseSync(path);

  db.exec("PRAGMA foreign_keys = ON;");


  db.exec("PRAGMA journal_mode = WAL;");

  return db;
}