import { useCallback, useEffect, useRef, useState } from 'react'
import { api, type Habit, UnauthorizedError } from './api.ts'
import { formatDay, parseDay } from './dates.ts'
import { useToday } from './useToday.ts'
import { Login } from './components/Login.tsx'
import { HabitCard } from './components/HabitCard.tsx'
import { HabitSheet, type SheetState } from './components/HabitSheet.tsx'
import { SortableHabits } from './components/SortableHabits.tsx'
import { ArchivedList } from './components/ArchivedList.tsx'

type Status = 'loading' | 'login' | 'ready' | 'offline'

export function App() {
  const [status, setStatus] = useState<Status>('loading')
  const [habits, setHabits] = useState<Habit[]>([])
  const [editing, setEditing] = useState(false)
  const [sheet, setSheet] = useState<SheetState>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const today = useToday()

  const showToast = useCallback((message: string) => {
    clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = setTimeout(() => setToast(null), 2200)
  }, [])

  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof UnauthorizedError) setStatus('login')
      else showToast(err instanceof Error ? err.message : 'Something went wrong')
    },
    [showToast],
  )

  const load = useCallback(async () => {
    try {
      setHabits(await api.habits())
      setStatus('ready')
    } catch (err) {
      if (err instanceof UnauthorizedError) setStatus('login')
      else setStatus((s) => (s === 'loading' ? 'offline' : s))
    }
  }, [])

  useEffect(() => {
    load()
    const onVisible = () => document.visibilityState === 'visible' && load()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [load])

  const run = useCallback(
    async (action: () => Promise<Habit[]>) => {
      try {
        setHabits(await action())
        return true
      } catch (err) {
        handleError(err)
        return false
      }
    },
    [handleError],
  )

  const toggleDay = useCallback(
    (habit: Habit, day: string, announce: boolean) => {
      const done = !habit.days.includes(day)
      setHabits((list) =>
        list.map((h) =>
          h.id === habit.id ? { ...h, days: done ? [...h.days, day] : h.days.filter((d) => d !== day) } : h,
        ),
      )
      if (announce) showToast(`${done ? 'Marked' : 'Unmarked'} ${formatDay(day)}`)
      api.setDay(habit.id, day, done).catch((err) => {
        handleError(err)
        load()
      })
    },
    [handleError, load, showToast],
  )

  const reorder = useCallback(
    (orderedActive: Habit[]) => {
      const next = [...orderedActive, ...habits.filter((h) => h.archived)]
      setHabits(next)
      run(() => api.reorder(next.map((h) => h.id))).then((ok) => {
        if (!ok) load()
      })
    },
    [habits, run, load],
  )

  if (status === 'loading') return <div className="center muted">Loading…</div>
  if (status === 'login') return <Login onLoggedIn={load} />
  if (status === 'offline')
    return (
      <div className="center">
        <p className="muted">Can't reach the server.</p>
        <button className="btn" onClick={load}>
          Retry
        </button>
      </div>
    )

  const active = habits.filter((h) => !h.archived)
  const archived = habits.filter((h) => h.archived)
  const doneToday = active.filter((h) => h.days.includes(today)).length
  const title = parseDay(today).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <div className="app">
      <header className="top">
        <div>
          <h1>{title}</h1>
          {active.length > 0 && (
            <p className="muted">
              {doneToday}/{active.length} done today
            </p>
          )}
        </div>
        <div className="top-actions">
          {active.length > 0 && (
            <button className="btn ghost" onClick={() => setEditing((e) => !e)}>
              {editing ? 'Done' : 'Edit'}
            </button>
          )}
          <button className="btn icon" aria-label="Add habit" onClick={() => setSheet({ mode: 'create' })}>
            +
          </button>
        </div>
      </header>

      {active.length === 0 && (
        <div className="empty">
          <p className="muted">No habits yet.</p>
          <button className="btn" onClick={() => setSheet({ mode: 'create' })}>
            Add your first habit
          </button>
        </div>
      )}

      {editing ? (
        <SortableHabits habits={active} onReorder={reorder} onOpen={(habit) => setSheet({ mode: 'edit', habit })} />
      ) : (
        <main className="list">
          {active.map((habit) => (
            <HabitCard key={habit.id} habit={habit} today={today} onToggle={toggleDay} />
          ))}
        </main>
      )}

      <ArchivedList
        habits={archived}
        onRestore={(habit) => run(() => api.update(habit.id, { archived: false }))}
        onOpen={(habit) => setSheet({ mode: 'edit', habit })}
      />

      <footer className="foot">
        <a href="/api/export" download>
          Export data
        </a>
        <span>·</span>
        <button
          className="link"
          onClick={async () => {
            await api.logout().catch(() => null)
            setStatus('login')
          }}
        >
          Log out
        </button>
      </footer>

      <HabitSheet
        state={sheet}
        onClose={() => setSheet(null)}
        onCreate={(name, color) => run(() => api.create(name, color, today))}
        onSave={(habit, name, color) => run(() => api.update(habit.id, { name, color }))}
        onArchive={(habit, archived) => run(() => api.update(habit.id, { archived }))}
        onDelete={(habit) => run(() => api.remove(habit.id))}
      />

      <div className={`toast ${toast ? 'show' : ''}`} role="status">
        {toast}
      </div>
    </div>
  )
}
