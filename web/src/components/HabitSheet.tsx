import { type FormEvent, useEffect, useState } from 'react'
import { COLORS, type Habit } from '../api.ts'

export type SheetState = { mode: 'create' } | { mode: 'edit'; habit: Habit } | null

type Props = {
  state: SheetState
  onClose: () => void
  onCreate: (name: string, color: string) => Promise<boolean>
  onSave: (habit: Habit, name: string, color: string) => Promise<boolean>
  onArchive: (habit: Habit, archived: boolean) => Promise<boolean>
  onDelete: (habit: Habit) => Promise<boolean>
}

export function HabitSheet({ state, onClose, onCreate, onSave, onArchive, onDelete }: Props) {
  const habit = state?.mode === 'edit' ? state.habit : null
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!state) return
    setName(habit?.name ?? '')
    setColor(habit?.color ?? COLORS[0])
    setBusy(false)
  }, [state, habit])

  useEffect(() => {
    if (!state) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const root = document.documentElement
    root.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      root.style.overflow = ''
    }
  }, [state, onClose])

  if (!state) return null

  async function act(action: () => Promise<boolean>) {
    setBusy(true)
    if (await action()) onClose()
    else setBusy(false)
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    act(() => (habit ? onSave(habit, trimmed, color) : onCreate(trimmed, color)))
  }

  return (
    <div className="overlay" onClick={onClose}>
      <form className="sheet" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>{habit ? 'Edit habit' : 'New habit'}</h2>
        <input
          className="input"
          placeholder="e.g. Read 10 pages"
          value={name}
          maxLength={80}
          onChange={(e) => setName(e.target.value)}
          autoFocus={!habit}
          enterKeyHint="done"
        />
        <div className="swatches" role="radiogroup" aria-label="Color">
          {COLORS.map((c) => (
            <button
              type="button"
              key={c}
              role="radio"
              aria-checked={c === color}
              aria-label={c}
              className={`swatch${c === color ? ' selected' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <button className="btn full" disabled={busy || !name.trim()}>
          {habit ? 'Save' : 'Add habit'}
        </button>
        {habit && (
          <div className="sheet-secondary">
            <button
              type="button"
              className="btn ghost"
              disabled={busy}
              onClick={() => act(() => onArchive(habit, !habit.archived))}
            >
              {habit.archived ? 'Unarchive' : 'Archive'}
            </button>
            <button
              type="button"
              className="btn ghost danger"
              disabled={busy}
              onClick={() => {
                if (confirm(`Delete "${habit.name}" and all its history? This can't be undone.`)) act(() => onDelete(habit))
              }}
            >
              Delete
            </button>
          </div>
        )}
        <button type="button" className="btn ghost full" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  )
}
