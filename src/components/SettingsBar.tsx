import { useStore } from '../store/useStore'
import type { FontSize } from '../types'

const SIZES: { id: FontSize; label: string }[] = [
  { id: 'small', label: 'S' },
  { id: 'medium', label: 'M' },
  { id: 'large', label: 'L' },
]

function PinIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 17v5" />
      <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
    </svg>
  )
}

function UndoIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 7v6h6" />
      <path d="M3 13a9 9 0 1 0 3-6.7L3 9" />
    </svg>
  )
}

function RedoIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 7v6h-6" />
      <path d="M21 13a9 9 0 1 1-3-6.7L21 9" />
    </svg>
  )
}

export function SettingsBar() {
  const fontSize = useStore((s) => s.settings.fontSize)
  const setFontSize = useStore((s) => s.setFontSize)
  const alwaysOnTop = useStore((s) => s.settings.alwaysOnTop)
  const toggleAlwaysOnTop = useStore((s) => s.toggleAlwaysOnTop)
  const current = useStore((s) => s.currentProject())
  const undo = useStore((s) => s.undo)
  const redo = useStore((s) => s.redo)
  const canUndo = useStore((s) => s.past.length > 0)
  const canRedo = useStore((s) => s.future.length > 0)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0.6em 1em',
        borderBottom: '1px solid var(--border)',
        background: 'var(--panel)',
        flexShrink: 0,
      }}
    >
      <div style={{ fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {current?.name ?? 'DreamList'}
      </div>
      <button
        onClick={undo}
        disabled={!canUndo}
        title="Rueckgaengig"
        aria-label="Rueckgaengig"
        className="pin-btn"
        style={{
          color: canUndo ? 'var(--muted)' : 'var(--border)',
          background: 'transparent',
          borderColor: 'var(--border)',
          opacity: canUndo ? 1 : 0.5,
          cursor: canUndo ? 'pointer' : 'not-allowed',
        }}
      >
        <UndoIcon />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        title="Vorwaerts"
        aria-label="Vorwaerts"
        className="pin-btn"
        style={{
          color: canRedo ? 'var(--muted)' : 'var(--border)',
          background: 'transparent',
          borderColor: 'var(--border)',
          opacity: canRedo ? 1 : 0.5,
          cursor: canRedo ? 'pointer' : 'not-allowed',
        }}
      >
        <RedoIcon />
      </button>
      <button
        onClick={toggleAlwaysOnTop}
        title={
          alwaysOnTop
            ? 'Immer im Vordergrund: AN (klicken zum Deaktivieren)'
            : 'Immer im Vordergrund: AUS (klicken zum Aktivieren)'
        }
        aria-pressed={alwaysOnTop}
        className="pin-btn"
        style={{
          color: alwaysOnTop ? 'var(--accent)' : 'var(--muted)',
          background: alwaysOnTop ? 'var(--accent-soft)' : 'transparent',
          borderColor: alwaysOnTop ? 'var(--accent)' : 'var(--border)',
        }}
      >
        <PinIcon active={alwaysOnTop} />
      </button>
      <div
        style={{
          display: 'flex',
          border: '1px solid var(--border)',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        {SIZES.map((s) => (
          <button
            key={s.id}
            onClick={() => setFontSize(s.id)}
            style={{
              padding: '0.3em 0.7em',
              background: fontSize === s.id ? 'var(--accent)' : 'transparent',
              color: fontSize === s.id ? '#fff' : 'var(--muted)',
              border: 0,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.85em',
              transition: 'background 120ms ease, color 120ms ease',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
