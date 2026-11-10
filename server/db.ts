import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

const volume = process.env.RAILWAY_VOLUME_MOUNT_PATH
const dbPath = resolve(process.env.DB_PATH ?? (volume ? join(volume, 'habits.db') : './data/habits.db'))

if (process.env.RAILWAY_ENVIRONMENT) {
  if (!volume) {
    throw new Error('No Railway volume attached. Add a volume to this service, otherwise data is lost on every deploy.')
  }
  if (relative(resolve(volume), dbPath).startsWith('..')) {
    throw new Error(`DB_PATH (${dbPath}) is outside the volume (${volume}). Remove DB_PATH or point it inside the volume.`)
  }
}

console.log(`database: ${dbPath}`)
mkdirSync(dirname(dbPath), { recursive: true })

export const db = new Database(dbPath)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    position INTEGER NOT NULL,
    archived_at TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS checkins (
    habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    PRIMARY KEY (habit_id, day)
  );
`)

export type HabitRow = {
  id: number
  name: string
  color: string
  position: number
  archived_at: string | null
  created_at: string
}
