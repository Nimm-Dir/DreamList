import { useEffect, useRef, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { autoBullet, todayIso, useStore } from '../store/useStore'
import type { Task } from '../types'
import { FormattedText } from './FormattedText'

type Props = {
  task: Task
  containerId: string
}

export function TaskItem({ task, containerId }: Props) {
  const assignDate = useStore((s) => s.assignDate)
  const withProjectUndo = useStore((s) => s.withProjectUndo)
  const deleteTask = useStore((s) => s.deleteTask)
  const updateTaskText = useStore((s) => s.updateTaskText)

  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.text)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const clickTimer = useRef<number | null>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', containerId, task },
    disabled: editing,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: editing ? 'default' : isDragging ? 'grabbing' : 'grab',
  }

  useEffect(() => {
    if (editing) {
      const el = textareaRef.current
      if (el) {
        el.focus()
        el.selectionStart = el.selectionEnd = el.value.length
        autoResize(el)
      }
    }
  }, [editing])

  useEffect(() => {
    return () => {
      if (clickTimer.current) window.clearTimeout(clickTimer.current)
    }
  }, [])

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 400) + 'px'
  }

  const startEditing = () => {
    setEditValue(task.text)
    setEditing(true)
  }

  const saveEdit = () => {
    updateTaskText(task.id, editValue)
    setEditing(false)
  }

  const cancelEdit = () => {
    setEditValue(task.text)
    setEditing(false)
  }

  const onEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      saveEdit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEdit()
    }
  }

  const isScheduled = task.date !== null

  const onCardClick = () => {
    if (editing) return
    if (clickTimer.current) window.clearTimeout(clickTimer.current)
    clickTimer.current = window.setTimeout(() => {
      clickTimer.current = null
      withProjectUndo(() => assignDate(task.id, isScheduled ? null : todayIso()))
    }, 220)
  }

  const onCardDoubleClick = () => {
    if (clickTimer.current) {
      window.clearTimeout(clickTimer.current)
      clickTimer.current = null
    }
    if (!editing) startEditing()
  }

  const stopDrag = (e: React.PointerEvent | React.MouseEvent) => e.stopPropagation()

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card ${isDragging ? 'dragging' : ''} ${isScheduled ? 'dated' : ''}`}
      onClick={onCardClick}
      onDoubleClick={onCardDoubleClick}
      title={
        editing
          ? undefined
          : isScheduled
            ? 'Klick: zurueck zu offen, Doppelklick: bearbeiten'
            : 'Klick: heute zuweisen, Doppelklick: bearbeiten'
      }
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {editing ? (
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => {
              setEditValue(autoBullet(e.target.value))
              autoResize(e.currentTarget)
            }}
            onKeyDown={onEditKeyDown}
            onBlur={saveEdit}
            onPointerDown={stopDrag}
            onClick={stopDrag}
            onDoubleClick={stopDrag}
            className="scroll-area"
            style={{
              width: '100%',
              background: 'var(--panel)',
              color: 'var(--text)',
              border: '1px solid var(--accent)',
              borderRadius: 6,
              padding: '0.3em 0.5em',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              lineHeight: 1.45,
              resize: 'none',
              outline: 'none',
              maxHeight: 400,
              cursor: 'text',
            }}
          />
        ) : (
          <FormattedText text={task.text} />
        )}
      </div>

      {!editing && (
        <div
          onPointerDown={stopDrag}
          onClick={stopDrag}
          onDoubleClick={stopDrag}
          style={{
            display: 'flex',
            gap: 4,
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <button
            className="icon-btn danger"
            title="Loeschen"
            onClick={() => deleteTask(task.id)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
