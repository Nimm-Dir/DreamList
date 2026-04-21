import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '../store/useStore'

type Props = {
  top: React.ReactNode
  bottom: React.ReactNode
}

export function SplitPane({ top, bottom }: Props) {
  const ratio = useStore((s) => s.settings.splitRatio)
  const setSplitRatio = useStore((s) => s.setSplitRatio)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    setDragging(true)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const y = e.clientY - rect.top
      const r = y / rect.height
      setSplitRatio(r)
    },
    [dragging, setSplitRatio],
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    setDragging(false)
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      /* noop */
    }
  }, [])

  useEffect(() => {
    if (!dragging) return
    const prev = document.body.style.cursor
    document.body.style.cursor = 'row-resize'
    return () => {
      document.body.style.cursor = prev
    }
  }, [dragging])

  const topFlex = Math.max(0.1, Math.min(0.9, ratio))
  const bottomFlex = 1 - topFlex

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <div style={{ flex: topFlex, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {top}
      </div>
      <div
        className={`divider-handle ${dragging ? 'active' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      <div style={{ flex: bottomFlex, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {bottom}
      </div>
    </div>
  )
}
