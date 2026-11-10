import { describe, expect, it } from 'vitest'
import { computeStreaks } from './streaks.ts'
import { addDays, buildWeeks, mondayOf } from './dates.ts'

describe('computeStreaks', () => {
  const today = '2026-11-10'

  it('is zero with no days', () => {
    expect(computeStreaks([], today)).toEqual({ current: 0, best: 0 })
  })

  it('counts from today when today is done', () => {
    expect(computeStreaks(['2026-11-08', '2026-11-09', '2026-11-10'], today)).toEqual({ current: 3, best: 3 })
  })

  it('keeps the streak alive from yesterday when today is not done yet', () => {
    expect(computeStreaks(['2026-11-08', '2026-11-09'], today)).toEqual({ current: 2, best: 2 })
  })

  it('breaks when yesterday was missed', () => {
    expect(computeStreaks(['2026-11-07', '2026-11-08'], today)).toEqual({ current: 0, best: 2 })
  })

  it('finds the best run across gaps and month boundaries', () => {
    const days = ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-05', '2026-11-10']
    expect(computeStreaks(days, today)).toEqual({ current: 1, best: 4 })
  })

  it('handles a single day', () => {
    expect(computeStreaks(['2026-01-01'], today)).toEqual({ current: 0, best: 1 })
  })

  it('ignores duplicates and order', () => {
    expect(computeStreaks(['2026-11-10', '2026-11-09', '2026-11-10'], today)).toEqual({ current: 2, best: 2 })
  })
})

describe('dates', () => {
  it('crosses DST without drifting', () => {
    expect(addDays('2026-03-28', 2)).toBe('2026-03-30')
    expect(addDays('2026-10-24', 2)).toBe('2026-10-26')
  })

  it('finds the monday of a week', () => {
    expect(mondayOf('2026-11-10')).toBe('2026-11-09')
    expect(mondayOf('2026-11-15')).toBe('2026-11-09')
    expect(mondayOf('2026-11-09')).toBe('2026-11-09')
  })

  it('builds week columns ending with the current week', () => {
    const weeks = buildWeeks('2026-11-10', 3)
    expect(weeks).toHaveLength(3)
    expect(weeks[0][0]).toBe('2026-10-26')
    expect(weeks[2][0]).toBe('2026-11-09')
    expect(weeks[2][6]).toBe('2026-11-15')
    expect(weeks.every((w) => w.length === 7)).toBe(true)
  })
})
