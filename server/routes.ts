import { Hono } from 'hono'
import { db, type HabitRow } from './db.ts'

const DAY = /^\d{4}-\d{2}-\d{2}$/
const COLOR = /^#[0-9a-fA-F]{6}$/

function listHabits() {
  const habits = db.prepare('SELECT * FROM habits ORDER BY position, id').all() as HabitRow[]
  const checkins = db.prepare('SELECT habit_id, day FROM checkins ORDER BY day').all() as {
    habit_id: number
    day: string
  }[]
  const byHabit = new Map<number, string[]>()
  for (const { habit_id, day } of checkins) {
    const days = byHabit.get(habit_id) ?? []
    days.push(day)
    byHabit.set(habit_id, days)
  }
  return habits.map((h) => ({
    id: h.id,
    name: h.name,
    color: h.color,
    archived: h.archived_at !== null,
    createdAt: h.created_at,
    days: byHabit.get(h.id) ?? [],
  }))
}

function findHabit(id: number) {
  return db.prepare('SELECT * FROM habits WHERE id = ?').get(id) as HabitRow | undefined
}

function cleanName(value: unknown) {
  if (typeof value !== 'string') return null
  const name = value.trim().slice(0, 80)
  return name || null
}

const setOrder = db.transaction((ids: number[]) => {
  const stmt = db.prepare('UPDATE habits SET position = ? WHERE id = ?')
  ids.forEach((id, index) => stmt.run(index, id))
})

export const api = new Hono()

api.get('/habits', (c) => c.json(listHabits()))

api.post('/habits', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const name = cleanName(body.name)
  if (!name) return c.json({ error: 'Name is required' }, 400)
  const color = typeof body.color === 'string' && COLOR.test(body.color) ? body.color : '#22c55e'
  const createdAt = typeof body.today === 'string' && DAY.test(body.today) ? body.today : new Date().toISOString().slice(0, 10)
  const { next } = db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS next FROM habits').get() as { next: number }
  db.prepare('INSERT INTO habits (name, color, position, created_at) VALUES (?, ?, ?, ?)').run(name, color, next, createdAt)
  return c.json(listHabits(), 201)
})

api.put('/habits/order', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  if (!Array.isArray(body.ids) || !body.ids.every((id: unknown) => Number.isInteger(id))) {
    return c.json({ error: 'ids must be an array of integers' }, 400)
  }
  setOrder(body.ids)
  return c.json(listHabits())
})

api.patch('/habits/:id', async (c) => {
  const id = Number(c.req.param('id'))
  const habit = findHabit(id)
  if (!habit) return c.json({ error: 'Not found' }, 404)
  const body = await c.req.json().catch(() => ({}))
  const name = body.name === undefined ? habit.name : cleanName(body.name)
  if (!name) return c.json({ error: 'Name is required' }, 400)
  const color = typeof body.color === 'string' && COLOR.test(body.color) ? body.color : habit.color
  const archivedAt =
    body.archived === undefined ? habit.archived_at : body.archived ? (habit.archived_at ?? new Date().toISOString()) : null
  db.prepare('UPDATE habits SET name = ?, color = ?, archived_at = ? WHERE id = ?').run(name, color, archivedAt, id)
  return c.json(listHabits())
})

api.delete('/habits/:id', (c) => {
  db.prepare('DELETE FROM habits WHERE id = ?').run(Number(c.req.param('id')))
  return c.json(listHabits())
})

api.put('/habits/:id/days/:day', (c) => {
  const id = Number(c.req.param('id'))
  const day = c.req.param('day')
  if (!DAY.test(day)) return c.json({ error: 'Invalid day' }, 400)
  if (!findHabit(id)) return c.json({ error: 'Not found' }, 404)
  db.prepare('INSERT OR IGNORE INTO checkins (habit_id, day) VALUES (?, ?)').run(id, day)
  return c.json({ ok: true })
})

api.delete('/habits/:id/days/:day', (c) => {
  db.prepare('DELETE FROM checkins WHERE habit_id = ? AND day = ?').run(Number(c.req.param('id')), c.req.param('day'))
  return c.json({ ok: true })
})

api.get('/export', (c) => {
  c.header('Content-Disposition', `attachment; filename="habbit-${new Date().toISOString().slice(0, 10)}.json"`)
  return c.json({ exportedAt: new Date().toISOString(), habits: listHabits() })
})
