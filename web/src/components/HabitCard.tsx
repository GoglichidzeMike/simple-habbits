import { type CSSProperties, memo, useMemo } from 'react'
import type { Habit } from '../api.ts'
import { computeStreaks } from '../streaks.ts'
import { Heatmap } from './Heatmap.tsx'

type Props = {
  habit: Habit
  today: string
  onToggle: (habit: Habit, day: string, announce: boolean) => void
}

export const HabitCard = memo(function HabitCard({ habit, today, onToggle }: Props) {
  const doneDays = useMemo(() => new Set(habit.days), [habit.days])
  const { current, best } = useMemo(() => computeStreaks(doneDays, today), [doneDays, today])
  const done = doneDays.has(today)

  return (
    <article className="card" style={{ '--c': habit.color } as CSSProperties}>
      <div className="card-head">
        <div className="card-title">
          <h2>{habit.name}</h2>
          <p className="muted small">
            {current > 0 ? `🔥 ${current} day${current === 1 ? '' : 's'}` : 'No streak'} · best {best} ·{' '}
            {doneDays.size} total
          </p>
        </div>
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
      <Heatmap
        doneDays={doneDays}
        createdAt={habit.createdAt}
        today={today}
        onToggle={(day) => onToggle(habit, day, day !== today)}
      />
    </article>
  )
})
