import { lazy, Suspense, useState } from 'react'
import {
  DndContext,
  MouseSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore } from '../store/useStore'
import type { Project } from '../types'
import { ConfirmDialog } from './ConfirmDialog'

const ThemeModal = lazy(() =>
  import('./ThemeModal').then((m) => ({ default: m.ThemeModal })),
)

export function Sidebar() {
  const projects = useStore((s) => s.projects)
  const currentId = useStore((s) => s.settings.currentProjectId)
  const collapsed = useStore((s) => s.settings.sidebarCollapsed)
  const toggleSidebar = useStore((s) => s.toggleSidebar)
  const createProject = useStore((s) => s.createProject)
  const reorderProjects = useStore((s) => s.reorderProjects)
  const deleteProject = useStore((s) => s.deleteProject)

  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 5 } }))

  const [editingId, setEditingId] = useState<string | null>(null)
  const [themeOpen, setThemeOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null)

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const ids = projects.map((p) => p.id)
    const activeIndex = ids.indexOf(String(active.id))
    const overIndex = ids.indexOf(String(over.id))
    if (activeIndex === -1 || overIndex === -1) return
    reorderProjects(arrayMove(ids, activeIndex, overIndex))
  }

  if (collapsed) {
    return (
      <div
        style={{
          width: 32,
          minWidth: 32,
          background: 'var(--panel)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 8,
          flexShrink: 0,
          transition: 'width 120ms ease',
        }}
      >
        <button
          className="icon-btn"
          title="Seitenleiste ausklappen"
          onClick={toggleSidebar}
          style={{ width: 24, height: 24 }}
        >
          ›
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        width: 220,
        minWidth: 180,
        background: 'var(--panel)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'width 120ms ease',
      }}
    >
      <div
        style={{
          padding: '0.9em 0.6em 0.7em 1em',
          fontWeight: 600,
          letterSpacing: '0.02em',
          color: 'var(--accent-hover)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ flex: 1 }}>DreamList</span>
        <button
          className="icon-btn"
          title="Seitenleiste einklappen"
          onClick={toggleSidebar}
          style={{ width: 22, height: 22 }}
        >
          ‹
        </button>
      </div>

      <div
        style={{
          padding: '0.5em 0.5em',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          flex: 1,
          overflowY: 'auto',
        }}
        className="scroll-area"
      >
        <div className="section-header" style={{ padding: '0.5em 0.5em 0.25em' }}>
          Listen
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={projects.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            {projects.map((p) => (
              <SortableProjectItem
                key={p.id}
                project={p}
                active={p.id === currentId}
                editing={editingId === p.id}
                onStartEdit={() => setEditingId(p.id)}
                onFinishEdit={() => setEditingId(null)}
                onRequestDelete={() => setPendingDelete({ id: p.id, name: p.name })}
                canDelete={projects.length > 1}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <div style={{ display: 'flex', gap: 6, margin: '0.5em' }}>
        <button
          onClick={() => {
            const id = createProject('Neue Liste')
            requestAnimationFrame(() => setEditingId(id))
          }}
          className="btn"
          style={{
            flex: 1,
            padding: '0.6em',
            justifyContent: 'center',
            borderColor: 'var(--border)',
          }}
        >
          + Neue Liste
        </button>
        <button
          className="pin-btn"
          onClick={() => setThemeOpen(true)}
          title="Farben und Templates"
          aria-label="Farben und Templates"
          style={{ width: 34, height: 34, color: 'var(--muted)' }}
        >
          <GearIcon />
        </button>
      </div>
      <div
        style={{
          fontSize: '0.7em',
          color: 'var(--muted)',
          textAlign: 'center',
          padding: '0.4em 0.5em 0.7em',
          opacity: 0.6,
        }}
      >
        Doppelklick = umbenennen · Ziehen = sortieren
      </div>
      {themeOpen && (
        <Suspense fallback={null}>
          <ThemeModal onClose={() => setThemeOpen(false)} />
        </Suspense>
      )}
      <ConfirmDialog
        open={!!pendingDelete}
        title="Liste loeschen"
        message={
          pendingDelete
            ? `Liste "${pendingDelete.name}" und alle Aufgaben loeschen?`
            : ''
        }
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteProject(pendingDelete.id)
          setPendingDelete(null)
        }}
      />
    </div>
  )
}

function GearIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

type ProjectItemProps = {
  project: Project
  active: boolean
  editing: boolean
  onStartEdit: () => void
  onFinishEdit: () => void
  onRequestDelete: () => void
  canDelete: boolean
}

function SortableProjectItem({
  project,
  active,
  editing,
  onStartEdit,
  onFinishEdit,
  onRequestDelete,
  canDelete,
}: ProjectItemProps) {
  const setCurrentProject = useStore((s) => s.setCurrentProject)
  const renameProject = useStore((s) => s.renameProject)
  const [editValue, setEditValue] = useState(project.name)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
    disabled: editing,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: editing ? 'default' : 'grab',
  }

  const commitRename = () => {
    renameProject(project.id, editValue)
    onFinishEdit()
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`sidebar-item ${active ? 'active' : ''}`}
      onClick={() => !editing && setCurrentProject(project.id)}
      onDoubleClick={() => {
        setEditValue(project.name)
        onStartEdit()
      }}
    >
      {editing ? (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename()
            if (e.key === 'Escape') onFinishEdit()
          }}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            flex: 1,
            minWidth: 0,
            boxSizing: 'border-box',
            background: 'var(--panel-alt)',
            color: 'var(--text)',
            border: 'none',
            boxShadow: 'inset 0 0 0 1px var(--accent)',
            borderRadius: 4,
            padding: '0 0.4em',
            margin: 0,
            fontSize: 'inherit',
            fontFamily: 'inherit',
            lineHeight: 'inherit',
            height: '1.2em',
            outline: 'none',
          }}
        />
      ) : (
        <>
          <span
            style={{
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {project.name}
          </span>
          <span style={{ color: 'var(--muted)', fontSize: '0.8em' }}>{project.tasks.length}</span>
          {canDelete && (
            <button
              className="icon-btn danger"
              title="Liste loeschen"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onRequestDelete()
              }}
              style={{ width: 20, height: 20, fontSize: '0.9em' }}
            >
              ×
            </button>
          )}
        </>
      )}
    </div>
  )
}
