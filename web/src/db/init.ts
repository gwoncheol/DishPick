import type Database from 'better-sqlite3'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import { seedIfEmpty } from './seed'

export async function ensureSchemaAndSeed(
  db: BetterSQLite3Database<typeof schema>,
  sqlite: Database.Database,
) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS category (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS food (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      FOREIGN KEY (category_id) REFERENCES category(id)
    );

    CREATE TABLE IF NOT EXISTS recipe (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      food_id INTEGER NOT NULL UNIQUE,
      ingredients TEXT NOT NULL,
      steps TEXT NOT NULL,
      FOREIGN KEY (food_id) REFERENCES food(id)
    );
  `)

  await seedIfEmpty(db)
}
