import { useMemo } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { sortTasks, todayIso, useStore } from '../store/useStore'
import type { Task } from '../types'
import { TaskItem } from './TaskItem'
import { useCrossContainerHighlight } from '../dnd/useCrossContainerHighlight'

export const DATE_CONTAINER_PREFIX = 'date:'
export const DATE_PICKER_ZONE_ID = 'datepicker-zone'

const MONTH_NAMES = [
  'Januar', 'Februar', 'Maerz', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]
const WEEKDAY_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']

type DayGroup = { date: string; tasks: Task[] }
type MonthGroup = { key: string; year: number; month: number; days: DayGroup[] }
type YearGroup = { year: number; months: MonthGroup[] }

function groupTasks(tasks: Task[]): YearGroup[] {
  const dated = tasks.filter((t) => t.date !== null) as (Task & { date: string })[]
  const byDay = new Map<string, Task[]>()
  for (const t of dated) {
    const list = byDay.get(t.date) ?? []
    list.push(t)
    byDay.set(t.date, list)
  }
  const days: DayGroup[] = [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([date, ts]) => ({ date, tasks: sortTasks(ts) }))

  const byYearMonth = new Map<string, DayGroup[]>()
  for (const d of days) {
    const [y, m] = d.date.split('-')
    const key = `${y}-${m}`
    const list = byYearMonth.get(key) ?? []
    list.push(d)
    byYearMonth.set(key, list)
  }

  const months: MonthGroup[] = [...byYearMonth.entries()]
    .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
    .map(([key, dayList]) => {
      const [y, m] = key.split('-').map(Number)
      return { key, year: y, month: m, days: dayList }
    })

  const byYear = new Map<number, MonthGroup[]>()
  for (const mg of months) {
    const list = byYear.get(mg.year) ?? []
    list.push(mg)
    byYear.set(mg.year, list)
  }

  return [...byYear.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, ms]) => ({ year, months: ms }))
}

function formatDay(date: string): { label: string; isToday: boolean } {
  const [y, m, d] = date.split('-').map(Number)
  const js = new Date(y, m - 1, d)
  const wd = WEEKDAY_NAMES[js.getDay()]
  return {
    label: `${wd}, ${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.`,
    isToday: date === todayIso(),
  }
}

export function ScheduledTree() {
  const tasks = useStore((s) => s.currentProject()?.tasks ?? [])
  const expanded = useStore((s) => s.settings.expandedNodes)
  const toggleExpanded = useStore((s) => s.toggleExpanded)

  const groups = useMemo(() => groupTasks(tasks), [tasks])

  const datedCount = tasks.filter((t) => t.date !== null).length

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0.9em 1em 0.5em',
        }}
      >
        <div className="section-header" style={{ flex: 1, padding: 0 }}>
          Erledigt ({datedCount})
        </div>
        <DatePickerDropZone />
      </div>
      <div
        className="scroll-area"
        style={{
          flex: 1,
          minHeight: 0,
          padding: '0.25em 0.75em 0.75em',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        {groups.map((yg) => {
          const yKey = `y:${yg.year}`
          const yOpen = expanded[yKey] ?? true
          const yTaskCount = yg.months.reduce(
            (n, mg) => n + mg.days.reduce((nn, d) => nn + d.tasks.length, 0),
            0,
          )
          return (
            <div key={yg.year}>
              <div className="tree-node-toggle" onClick={() => toggleExpanded(yKey)}>
                <span style={{ width: 14, display: 'inline-block' }}>{yOpen ? '▾' : '▸'}</span>
                <span style={{ fontWeight: 600 }}>{yg.year}</span>
                <span style={{ opacity: 0.6, fontSize: '0.85em' }}>({yTaskCount})</span>
              </div>
              {yOpen && (
                <div style={{ paddingLeft: 14 }}>
                  {yg.months.map((mg) => {
                    const mKey = `m:${mg.key}`
                    const mOpen = expanded[mKey] ?? true
                    const mTaskCount = mg.days.reduce((n, d) => n + d.tasks.length, 0)
                    return (
                      <div key={mg.key}>
                        <div className="tree-node-toggle" onClick={() => toggleExpanded(mKey)}>
                          <span style={{ width: 14, display: 'inline-block' }}>
                            {mOpen ? '▾' : '▸'}
                          </span>
                          <span>{MONTH_NAMES[mg.month - 1]}</span>
                          <span style={{ opacity: 0.6, fontSize: '0.85em' }}>({mTaskCount})</span>
                        </div>
                        {mOpen && (
                          <div style={{ paddingLeft: 14 }}>
                            {mg.days.map((day) => (
                              <DayNode
                                key={day.date}
                                date={day.date}
                                tasks={day.tasks}
                                expandedKey={`d:${day.date}`}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DayNode({
  date,
  tasks,
  expandedKey,
}: {
  date: string
  tasks: Task[]
  expandedKey: string
}) {
  const expanded = useStore((s) => s.settings.expandedNodes[expandedKey] ?? true)
  const toggleExpanded = useStore((s) => s.toggleExpanded)
  const { label, isToday } = formatDay(date)
  const containerId = `${DATE_CONTAINER_PREFIX}${date}`
  const { setNodeRef } = useDroppable({
    id: containerId,
    data: { type: 'container', containerId, date },
  })
  const highlight = useCrossContainerHighlight(containerId)
  const ids = tasks.map((t) => t.id)

  return (
    <div>
      <div
        className={`tree-node-toggle tree-day ${isToday ? 'today' : ''}`}
        onClick={() => toggleExpanded(expandedKey)}
      >
        <span style={{ width: 14, display: 'inline-block' }}>{expanded ? '▾' : '▸'}</span>
        <span>{label}</span>
        <span style={{ opacity: 0.6, fontSize: '0.85em' }}>({tasks.length})</span>
        {isToday && (
          <span
            style={{
              fontSize: '0.7em',
              background: 'var(--accent-soft)',
              color: 'var(--accent-hover)',
              padding: '2px 6px',
              borderRadius: 4,
              marginLeft: 4,
            }}
          >
            Heute
          </span>
        )}
      </div>
      {expanded && (
        <div
          ref={setNodeRef}
          className={highlight ? 'drop-zone-active' : ''}
          style={{
            paddingLeft: 14,
            paddingTop: 4,
            paddingBottom: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            minHeight: 8,
            borderRadius: 6,
          }}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {tasks.map((t) => (
              <TaskItem key={t.id} task={t} containerId={containerId} />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  )
}

function DatePickerDropZone() {
  const { setNodeRef, isOver } = useDroppable({
    id: DATE_PICKER_ZONE_ID,
    data: { type: 'picker' },
  })
  return (
    <div
      ref={setNodeRef}
      className={`date-picker-dropzone ${isOver ? 'over' : ''}`}
      title="Aufgabe hierher ziehen, um ein Datum festzulegen"
    >
      Datum festlegen
    </div>
  )
}
