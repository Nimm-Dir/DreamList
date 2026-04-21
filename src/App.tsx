import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  pointerWithin,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { Sidebar } from './components/Sidebar'
import { SettingsBar } from './components/SettingsBar'
import { TaskInput } from './components/TaskInput'
import { OpenTasksPanel, OPEN_CONTAINER } from './components/OpenTasksPanel'
import { ScheduledTree, DATE_CONTAINER_PREFIX, DATE_PICKER_ZONE_ID } from './components/ScheduledTree'
import { SplitPane } from './components/SplitPane'
import { FormattedText } from './components/FormattedText'
import { sortTasks, useStore } from './store/useStore'
import type { Project, Task } from './types'

const PickDateModal = lazy(() =>
  import('./components/PickDateModal').then((m) => ({ default: m.PickDateModal })),
)

export default function App() {
  const hydrated = useStore((s) => s.hydrated)
  const init = useStore((s) => s.init)
  const fontSize = useStore((s) => s.settings.fontSize)

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('font-small', 'font-medium', 'font-large')
    root.classList.add(`font-${fontSize}`)
  }, [fontSize])

  if (!hydrated) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--muted)',
        }}
      >
        Laedt...
      </div>
    )
  }

  return (
    <AppBody />
  )
}

function containerIdOf(id: string | null | undefined, tasks: Task[]): string | null {
  if (!id) return null
  if (id === OPEN_CONTAINER) return OPEN_CONTAINER
  if (typeof id === 'string' && id.startsWith(DATE_CONTAINER_PREFIX)) return id
  const task = tasks.find((t) => t.id === id)
  if (!task) return null
  return task.date === null ? OPEN_CONTAINER : `${DATE_CONTAINER_PREFIX}${task.date}`
}

function dateFromContainer(containerId: string): string | null {
  if (containerId === OPEN_CONTAINER) return null
  if (containerId.startsWith(DATE_CONTAINER_PREFIX)) return containerId.slice(DATE_CONTAINER_PREFIX.length)
  return null
}

const collisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args)
  const pickerHit = pointerHits.find((c) => c.id === DATE_PICKER_ZONE_ID)
  if (pickerHit) return [pickerHit]
  if (pointerHits.length > 0) return pointerHits
  return closestCenter(args)
}

function AppBody() {
  const tasks = useStore((s) => s.currentProject()?.tasks ?? [])
  const assignDate = useStore((s) => s.assignDate)
  const reorderOpen = useStore((s) => s.reorderOpen)
  const reorderDate = useStore((s) => s.reorderDate)
  const pushHistory = useStore((s) => s.pushHistory)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  )

  const [activeId, setActiveId] = useState<string | null>(null)
  const [pendingPickerId, setPendingPickerId] = useState<string | null>(null)
  const tasksRef = useRef(tasks)
  tasksRef.current = tasks
  const moveSnapshotRef = useRef<Project[] | null>(null)

  const commitMoveIfChanged = () => {
    const snap = moveSnapshotRef.current
    moveSnapshotRef.current = null
    if (!snap) return
    const current = useStore.getState().projects
    if (JSON.stringify(snap) !== JSON.stringify(current)) {
      pushHistory(snap)
    }
  }

  const activeTask = useMemo(
    () => (activeId ? tasks.find((t) => t.id === activeId) ?? null : null),
    [activeId, tasks],
  )

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id))
    moveSnapshotRef.current = structuredClone(useStore.getState().projects)
  }

  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e
    if (!over) return
    if (over.id === DATE_PICKER_ZONE_ID) return
    const activeContainer = containerIdOf(String(active.id), tasksRef.current)
    const overContainer = containerIdOf(String(over.id), tasksRef.current)
    if (!activeContainer || !overContainer) return
    if (activeContainer === overContainer) return

    const newDate = dateFromContainer(overContainer)
    assignDate(String(active.id), newDate)
  }

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    setActiveId(null)
    if (!over) {
      moveSnapshotRef.current = null
      return
    }
    if (over.id === DATE_PICKER_ZONE_ID) {
      setPendingPickerId(String(active.id))
      return
    }
    const currentTasks = tasksRef.current
    const overContainer = containerIdOf(String(over.id), currentTasks)
    if (!overContainer) {
      commitMoveIfChanged()
      return
    }

    const date = dateFromContainer(overContainer)
    const section = currentTasks.filter((t) => t.date === date)
    const sectionSorted = sortTasks(section)
    const sectionIds = sectionSorted.map((t) => t.id)

    const activeIndex = sectionIds.indexOf(String(active.id))
    let overIndex = sectionIds.indexOf(String(over.id))
    if (overIndex === -1) overIndex = sectionIds.length - 1

    if (activeIndex === -1) {
      commitMoveIfChanged()
      return
    }

    const newIds = arrayMove(sectionIds, activeIndex, overIndex)
    if (date === null) {
      reorderOpen(newIds)
    } else {
      reorderDate(date, newIds)
    }
    commitMoveIfChanged()
  }

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%' }}>
      <Sidebar />
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={() => {
          setActiveId(null)
          moveSnapshotRef.current = null
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <SettingsBar />
          <TaskInput />
          <SplitPane top={<OpenTasksPanel />} bottom={<ScheduledTree />} />
        </div>
        <DragOverlay>
          {activeTask ? (
            <div
              className="task-card"
              style={{
                boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
                borderColor: 'var(--accent)',
                cursor: 'grabbing',
                opacity: 0.75,
                pointerEvents: 'none',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <FormattedText text={activeTask.text} />
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      {pendingPickerId && (
        <Suspense fallback={null}>
          <PickDateModal
            taskId={pendingPickerId}
            onClose={(assigned) => {
              setPendingPickerId(null)
              if (assigned) {
                commitMoveIfChanged()
              } else {
                moveSnapshotRef.current = null
              }
            }}
          />
        </Suspense>
      )}
    </div>
  )
}
