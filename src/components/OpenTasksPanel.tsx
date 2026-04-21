import { useMemo } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { sortTasks, useStore } from '../store/useStore'
import { TaskItem } from './TaskItem'
import { useCrossContainerHighlight } from '../dnd/useCrossContainerHighlight'

export const OPEN_CONTAINER = 'open'

export function OpenTasksPanel() {
  const tasks = useStore((s) => s.currentProject()?.tasks ?? [])
  const openTasks = useMemo(() => sortTasks(tasks.filter((t) => t.date === null)), [tasks])
  const ids = openTasks.map((t) => t.id)

  const { setNodeRef } = useDroppable({
    id: OPEN_CONTAINER,
    data: { type: 'container', containerId: OPEN_CONTAINER },
  })
  const highlight = useCrossContainerHighlight(OPEN_CONTAINER)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <div className="section-header">Offen ({openTasks.length})</div>
      <div
        ref={setNodeRef}
        className={`scroll-area ${highlight ? 'drop-zone-active' : ''}`}
        style={{
          flex: 1,
          minHeight: 0,
          padding: '0.25em 0.75em 0.75em',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          borderRadius: 6,
        }}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {openTasks.map((task) => (
            <TaskItem key={task.id} task={task} containerId={OPEN_CONTAINER} />
          ))}
          {openTasks.length === 0 && (
            <div
              style={{
                color: 'var(--muted)',
                fontStyle: 'italic',
                padding: '1em',
                textAlign: 'center',
                opacity: 0.7,
              }}
            >
              Noch keine offenen Aufgaben. Schreib oben was rein!
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}
