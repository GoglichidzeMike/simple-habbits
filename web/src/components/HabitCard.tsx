import { type CSSProperties, memo, useMemo } from 'react'
import type { Habit } from '../api.ts'
import { addDays } from '../dates.ts'
import { computeStreaks } from '../streaks.ts'
import { Heatmap } from './Heatmap.tsx'

const RECENT_DAYS = 14

type Props = {
  habit: Habit
  today: string
  expanded: boolean
  onExpand: (id: number) => void
  onToggle: (habit: Habit, day: string, announce: boolean) => void
}

export const HabitCard = memo(function HabitCard({ habit, today, expanded, onExpand, onToggle }: Props) {
  const doneDays = useMemo(() => new Set(habit.days), [habit.days])
  const { current, best } = useMemo(() => computeStreaks(doneDays, today), [doneDays, today])
  const recent = useMemo(
    () => Array.from({ length: RECENT_DAYS }, (_, i) => addDays(today, i - RECENT_DAYS + 1)),
    [today],
  )
  const done = doneDays.has(today)

  return (
    <li className={`habit${expanded ? ' open' : ''}`} style={{ '--c': habit.color } as CSSProperties}>
      <div className="habit-row">
        <button className="habit-toggle" aria-expanded={expanded} onClick={() => onExpand(habit.id)}>
          <span className="habit-main">
            <span className="habit-name">{habit.name}</span>
            <span className="strip" aria-hidden="true">
              {recent.map((day) => {
                const isDone = doneDays.has(day)
                const before = day < habit.createdAt && !isDone
                return (
                  <span
                    key={day}
                    className={`cell${isDone ? ' done' : ''}${before ? ' before' : ''}${day === today ? ' today' : ''}`}
                  />
                )
              })}
            </span>
          </span>
          <span className={`streak${current > 0 ? '' : ' muted'}`}>{current > 0 ? `🔥${current}` : '–'}</span>
        </button>
        <button
          className={`check ${done ? 'done' : ''}`}
          aria-pressed={done}
          aria-label={done ? `Unmark ${habit.name} for today` : `Mark ${habit.name} done today`}
          onClick={() => onToggle(habit, today, false)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </button>
      </div>
      {expanded && (
        <div className="habit-detail">
          <p className="muted small">
            Current {current} · best {best} · {doneDays.size} total · tap a day to change it
          </p>
          <Heatmap
            doneDays={doneDays}
            createdAt={habit.createdAt}
            today={today}
            onToggle={(day) => onToggle(habit, day, day !== today)}
          />
        </div>
      )}
    </li>
  )
})
