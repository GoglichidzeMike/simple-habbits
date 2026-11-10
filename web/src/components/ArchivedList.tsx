import type { Habit } from '../api.ts'

type Props = {
  habits: Habit[]
  onRestore: (habit: Habit) => void
  onOpen: (habit: Habit) => void
}

export function ArchivedList({ habits, onRestore, onOpen }: Props) {
  if (habits.length === 0) return null

  return (
    <details className="archived">
      <summary>Archived ({habits.length})</summary>
      <ul>
        {habits.map((habit) => (
          <li key={habit.id} className="row">
            <button className="row-main" onClick={() => onOpen(habit)}>
              <span className="dot" style={{ background: habit.color }} />
              <span className="row-name">{habit.name}</span>
            </button>
            <button className="btn ghost small" onClick={() => onRestore(habit)}>
              Restore
            </button>
          </li>
        ))}
      </ul>
    </details>
  )
}
