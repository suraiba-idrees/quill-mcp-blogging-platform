import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { getDb } from "./connection.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "migrations");

function ensureMigrationsTable(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename    TEXT PRIMARY KEY,
      applied_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `);
}

function getAppliedMigrations(): Set<string> {
  const db = getDb();
  const rows = db
    .prepare("SELECT filename FROM _migrations")
    .all() as { filename: string }[];
  return new Set(rows.map((r) => r.filename));
}

function getMigrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort(); // filename order, e.g. 001_..., 002_...
}

export function runMigrations(): void {
  const db = getDb();
  ensureMigrationsTable();

  const applied = getAppliedMigrations();
  const files = getMigrationFiles();
  const pending = files.filter((f) => !applied.has(f));

  if (pending.length === 0) {
    console.log("No pending migrations. Database is up to date.");
    return;
  }

  for (const filename of pending) {
    const filePath = join(MIGRATIONS_DIR, filename);
    const sql = readFileSync(filePath, "utf-8");

    console.log(`Applying migration: ${filename}`);

    db.exec("BEGIN");
    try {
      db.exec(sql);
      db.prepare("INSERT INTO _migrations (filename) VALUES (?)").run(filename);
      db.exec("COMMIT");
      console.log(`  ✓ ${filename} applied`);
    } catch (err) {
      db.exec("ROLLBACK");
      console.error(`  ✗ ${filename} failed, rolled back`);
      throw err;
    }
  }

  console.log(`Done. Applied ${pending.length} migration(s).`);
}

// Allow running directly: npx tsx src/database/migrate.ts
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  runMigrations();
}