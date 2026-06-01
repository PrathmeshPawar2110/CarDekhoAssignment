import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'

const PRIORITIES = [
  { id: 'mileage', label: 'Mileage', icon: '⛽' },
  { id: 'safety', label: 'Safety', icon: '🛡️' },
  { id: 'boot_space', label: 'Boot Space', icon: '🧳' },
  { id: 'performance', label: 'Performance', icon: '⚡' },
  { id: 'low_maintenance', label: 'Low Maintenance', icon: '🔧' },
  { id: 'resale_value', label: 'Resale Value', icon: '💰' },
]

const RANK_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Most Important', color: 'text-emerald-600 bg-emerald-50' },
  1: { label: 'Important', color: 'text-blue-600 bg-blue-50' },
  2: { label: 'Nice to Have', color: 'text-violet-600 bg-violet-50' },
}

function SortableItem({
  id,
  rank,
}: {
  id: string
  rank: number
}) {
  const priority = PRIORITIES.find((p) => p.id === id)!
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'none',
  }

  const rankInfo = RANK_LABELS[rank]
  const isHighPriority = rank < 3

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'flex items-center gap-3 p-3 rounded-xl border-2 cursor-grab active:cursor-grabbing select-none transition-all',
        isDragging ? 'shadow-lg scale-105 z-50' : '',
        isHighPriority ? 'border-gray-200 bg-white' : 'border-dashed border-gray-200 bg-gray-50 opacity-70'
      )}
    >
      <div className="text-gray-400 flex-shrink-0">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z" />
        </svg>
      </div>
      <span className="text-xl">{priority.icon}</span>
      <span className={cn('flex-1 font-medium', isHighPriority ? 'text-gray-800' : 'text-gray-500')}>
        {priority.label}
      </span>
      <span
        className={cn(
          'text-xs font-semibold px-2 py-0.5 rounded-full',
          rankInfo ? rankInfo.color : 'text-gray-400 bg-gray-100'
        )}
      >
        {rankInfo ? rankInfo.label : 'Lower Priority'}
      </span>
    </div>
  )
}

interface Props {
  priorities: string[]
  onChange: (priorities: string[]) => void
}

export function PriorityStep({ priorities, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = priorities.indexOf(active.id as string)
      const newIndex = priorities.indexOf(over.id as string)
      onChange(arrayMove(priorities, oldIndex, newIndex))
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">What matters most to you?</h2>
        <p className="mt-2 text-gray-500">Drag to rank your priorities — top 3 get the most weight</p>
      </div>

      <div className="flex gap-2 justify-center">
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn('text-xs font-medium px-2 py-1 rounded-full', RANK_LABELS[i].color)}>
            #{i + 1} {RANK_LABELS[i].label}
          </div>
        ))}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={priorities} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {priorities.map((id, index) => (
              <SortableItem key={id} id={id} rank={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
