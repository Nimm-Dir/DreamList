import { useEffect } from 'react'

type Props = {
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Loeschen',
  cancelLabel = 'Abbrechen',
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      } else if (e.key === 'Enter') {
        e.preventDefault()
        onConfirm()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel, onConfirm])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ minWidth: 320, maxWidth: 420 }}
      >
        {title && (
          <div style={{ fontWeight: 600, color: 'var(--accent-hover)', marginBottom: 8 }}>
            {title}
          </div>
        )}
        <div style={{ color: 'var(--text)', marginBottom: 16, lineHeight: 1.45 }}>{message}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            className="btn"
            onClick={onCancel}
            style={{ borderColor: 'var(--border)' }}
          >
            {cancelLabel}
          </button>
          <button
            autoFocus
            className="btn"
            onClick={onConfirm}
            style={
              danger
                ? { borderColor: 'var(--danger)', color: 'var(--danger)' }
                : { borderColor: 'var(--accent)', color: 'var(--accent)' }
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
