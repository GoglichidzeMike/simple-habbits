import { type MouseEvent, useLayoutEffect, useMemo, useRef } from 'react'
import { buildWeeks, parseDay } from '../dates.ts'

const WEEKS = 53
const WEEKDAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', '']

type Props = {
  doneDays: Set<string>
  createdAt: string
  today: string
  onToggle: (day: string) => void
}

export function Heatmap({ doneDays, createdAt, today, onToggle }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const weeks = useMemo(() => buildWeeks(today, WEEKS), [today])

  const months = useMemo(
    () =>
      weeks.map((week, i) => {
        const month = parseDay(week[0]).getMonth()
        const prevMonth = i === 0 ? -1 : parseDay(weeks[i - 1][0]).getMonth()
        return month !== prevMonth && i < weeks.length - 1
          ? parseDay(week[0]).toLocaleDateString(undefined, { month: 'short' })
          : ''
      }),
    [weeks],
  )

  useLayoutEffect(() => {
    const el = scroller.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [today])

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-day]')
    if (target?.dataset.day) onToggle(target.dataset.day)
  }

  return (
    <div className="heatmap">
      <div className="weekdays" aria-hidden="true">
        {WEEKDAY_LABELS.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </div>
      <div className="heatmap-scroll" ref={scroller}>
        <div className="heatmap-grid" onClick={handleClick}>
          {weeks.map((week, i) => (
            <div className="week" key={week[0]}>
              <span className="month">{months[i]}</span>
              {week.map((day) => {
                if (day > today) return <span key={day} className="cell future" />
                const before = day < createdAt
                const done = doneDays.has(day)
                const cls = `cell${done ? ' done' : ''}${before && !done ? ' before' : ''}${day === today ? ' today' : ''}`
                return <span key={day} className={cls} data-day={day} />
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
