import { useEffect, useRef, useState } from 'react'
import { autoBullet, useStore } from '../store/useStore'

export function TaskInput() {
  const addTask = useStore((s) => s.addTask)
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const autoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 280) + 'px'
  }

  useEffect(() => {
    autoResize()
  }, [value])

  const submit = () => {
    const text = value.trim()
    if (!text) return
    addTask(text)
    setValue('')
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="px-4 pt-3 pb-2">
      <div
        className="flex gap-2 items-end rounded-lg"
        style={{
          background: 'var(--panel-alt)',
          border: '1px solid var(--border)',
          padding: '0.5em 0.65em',
          transition: 'border-color 120ms ease',
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(autoBullet(e.target.value))}
          onKeyDown={onKeyDown}
          placeholder="Neue Aufgabe... (Shift+Enter fuer neue Zeile)"
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text)',
            fontSize: 'inherit',
            fontFamily: 'inherit',
            lineHeight: 1.45,
            minHeight: '1.6em',
            maxHeight: 280,
            overflowY: 'auto',
          }}
          className="scroll-area"
        />
      </div>
    </div>
  )
}
