import { todayIso } from '../store/useStore'

type Props = {
  year: number
  month: number
  value: string
  onPick: (iso: string) => void
  onNav?: (delta: -1 | 1) => void
}

export const MONTH_NAMES = [
  'Januar', 'Februar', 'Maerz', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]
const WEEKDAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

function toIso(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function parseIso(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m, d }
}

export function MonthCalendar({ year, month, value, onPick, onNav }: Props) {
  const today = todayIso()
  const todayParsed = parseIso(today)

  const firstDay = new Date(year, month - 1, 1)
  const jsDow = firstDay.getDay()
  const leadingBlanks = (jsDow + 6) % 7
  const daysInMonth = new Date(year, month, 0).getDate()

  const cells: Array<{ day: number | null; iso: string | null }> = []
  for (let i = 0; i < leadingBlanks; i++) cells.push({ day: null, iso: null })
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, iso: toIso(year, month, d) })
  while (cells.length % 7 !== 0) cells.push({ day: null, iso: null })

  return (
    <div className="calendar">
      <div className="calendar-head">
        {onNav ? (
          <button
            type="button"
            className="icon-btn"
            onClick={() => onNav(-1)}
            title="Vorheriger Monat"
            aria-label="Vorheriger Monat"
          >
            ‹
          </button>
        ) : (
          <span style={{ width: 24 }} />
        )}
        <div className="calendar-title">
          {MONTH_NAMES[month - 1]} {year}
        </div>
        {onNav ? (
          <button
            type="button"
            className="icon-btn"
            onClick={() => onNav(1)}
            title="Naechster Monat"
            aria-label="Naechster Monat"
          >
            ›
          </button>
        ) : (
          <span style={{ width: 24 }} />
        )}
      </div>
      <div className="calendar-grid">
        {WEEKDAYS_SHORT.map((w) => (
          <div key={w} className="calendar-weekday">
            {w}
          </div>
        ))}
        {cells.map((cell, i) => {
          if (cell.day === null) {
            return <div key={i} className="calendar-cell blank" />
          }
          const isToday =
            todayParsed.y === year && todayParsed.m === month && todayParsed.d === cell.day
          const isSelected = cell.iso === value
          return (
            <div
              key={i}
              className={`calendar-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => cell.iso && onPick(cell.iso)}
            >
              {cell.day}
            </div>
          )
        })}
      </div>
    </div>
  )
}
