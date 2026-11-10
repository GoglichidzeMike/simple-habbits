import { addDays } from './dates.ts'

export function computeStreaks(days: Iterable<string>, today: string) {
  const set = new Set(days)
  const sorted = [...set].sort()

  let best = 0
  let run = 0
  let prev: string | null = null
  for (const day of sorted) {
    run = prev !== null && addDays(prev, 1) === day ? run + 1 : 1
    if (run > best) best = run
    prev = day
  }

  let current = 0
  let cursor = set.has(today) ? today : addDays(today, -1)
  while (set.has(cursor)) {
    current++
    cursor = addDays(cursor, -1)
  }

  return { current, best }
}
