import { useEffect, useMemo, useState } from 'react'
import { todayIso, useStore } from '../store/useStore'
import { MONTH_NAMES, MonthCalendar } from './MonthCalendar'

type Props = {
  taskId: string
  onClose: (assigned: boolean) => void
}

function parseView(iso: string): { y: number; m: number } {
  const [y, m] = iso.split('-').map(Number)
  return { y: y || new Date().getFullYear(), m: m || new Date().getMonth() + 1 }
}

export function PickDateModal({ taskId, onClose }: Props) {
  const assignDate = useStore((s) => s.assignDate)
  const task = useStore((s) => s.currentProject()?.tasks.find((t) => t.id === taskId))
  const initial = task?.date ?? todayIso()
  const [value, setValue] = useState(initial)
  const [view, setView] = useState(() => parseView(initial))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const yearRange = useMemo(() => {
    const now = new Date().getFullYear()
    const min = Math.min(now - 3, view.y)
    const max = Math.max(now + 15, view.y)
    const out: number[] = []
    for (let y = min; y <= max; y++) out.push(y)
    return out
  }, [view.y])

  if (!task) return null

  const commit = (iso: string) => {
    if (!iso) return
    assignDate(taskId, iso)
    onClose(true)
  }

  const onInputChange = (iso: string) => {
    setValue(iso)
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      setView(parseView(iso))
    }
  }

  const nav = (delta: -1 | 1) => {
    setView((v) => {
      const nm = v.m + delta
      if (nm < 1) return { y: v.y - 1, m: 12 }
      if (nm > 12) return { y: v.y + 1, m: 1 }
      return { y: v.y, m: nm }
    })
  }

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--accent-hover)' }}>
          Datum festlegen
        </div>
        <div
          style={{
            color: 'var(--muted)',
            fontSize: '0.85em',
            marginBottom: 12,
            maxHeight: 90,
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
          className="scroll-area"
        >
          {task.text}
        </div>
        <input
          type="date"
          value={value}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commit(value)
            }
          }}
          className="date-input-plain"
          style={{
            width: '100%',
            background: 'var(--panel-alt)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '0.5em 0.6em',
            fontSize: 'inherit',
            fontFamily: 'inherit',
            outline: 'none',
            marginBottom: 8,
          }}
        />
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <select
            className="dreamselect"
            value={view.m}
            onChange={(e) => setView((v) => ({ ...v, m: Number(e.target.value) }))}
            style={{ flex: 1 }}
          >
            {MONTH_NAMES.map((n, i) => (
              <option key={i} value={i + 1}>
                {n}
              </option>
            ))}
          </select>
          <select
            className="dreamselect"
            value={view.y}
            onChange={(e) => setView((v) => ({ ...v, y: Number(e.target.value) }))}
            style={{ width: 100 }}
          >
            {yearRange.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <MonthCalendar
          year={view.y}
          month={view.m}
          value={value}
          onPick={commit}
          onNav={nav}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <button
            className="btn"
            onClick={() => onClose(false)}
            style={{ borderColor: 'var(--border)' }}
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  )
}
