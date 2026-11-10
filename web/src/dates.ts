export function toDay(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseDay(day: string) {
  const [y, m, d] = day.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(day: string, amount: number) {
  const date = parseDay(day)
  date.setDate(date.getDate() + amount)
  return toDay(date)
}

export function todayDay() {
  return toDay(new Date())
}

export function mondayOf(day: string) {
  const weekday = (parseDay(day).getDay() + 6) % 7
  return addDays(day, -weekday)
}

export function buildWeeks(today: string, weekCount: number) {
  const start = addDays(mondayOf(today), -7 * (weekCount - 1))
  const weeks: string[][] = []
  for (let w = 0; w < weekCount; w++) {
    const week: string[] = []
    for (let d = 0; d < 7; d++) week.push(addDays(start, w * 7 + d))
    weeks.push(week)
  }
  return weeks
}

export function formatDay(day: string) {
  return parseDay(day).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}
