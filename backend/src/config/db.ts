import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { env } from './env';

export function createDatabase(dbPath: string = env.databasePath): Database.Database {
  if (dbPath !== ':memory:') {
    const dir = path.dirname(path.resolve(dbPath));
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath);

  // Production SQLite pragmas: WAL for concurrency, foreign keys enforced, busy timeout
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');

  initializeSchema(db);
  return db;
}

export function initializeSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL DEFAULT '',
      company TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'Website',
      status TEXT NOT NULL DEFAULT 'New'
        CHECK (status IN ('New', 'Contacted', 'Qualified', 'Lost')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
    CREATE INDEX IF NOT EXISTS idx_leads_user_status ON leads(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_leads_user_name ON leads(user_id, name COLLATE NOCASE);
    CREATE INDEX IF NOT EXISTS idx_leads_user_created ON leads(user_id, created_at DESC);
  `);
}
