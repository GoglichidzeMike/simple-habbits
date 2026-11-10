import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Habit } from '../api.ts'

type Props = {
  habits: Habit[]
  onReorder: (habits: Habit[]) => void
  onOpen: (habit: Habit) => void
}

export function SortableHabits({ habits, onReorder, onOpen }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return
    const from = habits.findIndex((h) => h.id === active.id)
    const to = habits.findIndex((h) => h.id === over.id)
    onReorder(arrayMove(habits, from, to))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={habits.map((h) => h.id)} strategy={verticalListSortingStrategy}>
        <ul className="sortable">
          {habits.map((habit) => (
            <SortableRow key={habit.id} habit={habit} onOpen={onOpen} />
          ))}
        </ul>
      </SortableContext>
      <p className="muted small hint">Drag ☰ to reorder. Tap a habit to edit, archive or delete it.</p>
    </DndContext>
  )
}

function SortableRow({ habit, onOpen }: { habit: Habit; onOpen: (habit: Habit) => void }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: habit.id,
  })

  return (
    <li
      ref={setNodeRef}
      className={`row${isDragging ? ' dragging' : ''}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <button className="row-main" onClick={() => onOpen(habit)}>
        <span className="dot" style={{ background: habit.color }} />
        <span className="row-name">{habit.name}</span>
      </button>
      <button className="handle" ref={setActivatorNodeRef} aria-label={`Reorder ${habit.name}`} {...attributes} {...listeners}>
        ☰
      </button>
    </li>
  )
}
