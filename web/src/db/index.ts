import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { ensureSchemaAndSeed } from './init'
import * as schema from './schema'

function resolveDbPath() {
  if (process.env.DATABASE_PATH) {
    return path.resolve(process.env.DATABASE_PATH)
  }

  const url = process.env.DATABASE_URL
  if (url?.startsWith('file:')) {
    return path.resolve(url.slice('file:'.length))
  }

  return path.resolve('./data/dishpick.db')
}

const dbPath = resolveDbPath()
fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const sqlite = new Database(dbPath)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })

await ensureSchemaAndSeed(db, sqlite)
