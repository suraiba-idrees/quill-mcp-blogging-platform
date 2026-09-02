// src/database/connection.ts

import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

// Yeh variable hamesha ek hi connection ko yaad rakhega,
// taake dobara dobara naya connection na banay.
let db: DatabaseSync | null = null;

/**
 * Database file ka path environment variable se leta hai.
 * Agar env variable set nahi hai, to local default use hota hai.
 */
function resolveDatabasePath(): string {
  return process.env.DATABASE_PATH || "./data/quill.db";
}

/**
 * Yeh function ek hi shared database connection deta hai.
 * Pehli dafa call hone par connection banata hai,
 * uske baad har baar wahi purana connection wapas karta hai.
 */
export function getDb(): DatabaseSync {
  if (db) {
    return db;
  }

  const path = resolveDatabasePath();

  // Agar "data" folder abhi tak exist nahi karta,
  // to usse pehle bana lo, warna SQLite file create nahi kar payega.
  mkdirSync(dirname(path), { recursive: true });

  db = new DatabaseSync(path);

  // Foreign key rules (jo humne Stage 1 mein banayi thi)
  // ko actually enforce karne ke liye yeh zaroori hai.
  db.exec("PRAGMA foreign_keys = ON;");

  // Reads aur writes ko ek dusre ko block karne se rokta hai.
  db.exec("PRAGMA journal_mode = WAL;");

  return db;
}