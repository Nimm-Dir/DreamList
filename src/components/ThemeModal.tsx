import { useEffect, useMemo, useState } from 'react'
import Wheel from '@uiw/react-color-wheel'
import ShadeSlider from '@uiw/react-color-shade-slider'
import { hsvaToHex, hexToHsva } from '@uiw/color-convert'
import { useStore } from '../store/useStore'
import type { ThemeColors } from '../types'
import { MAX_CUSTOM_THEMES } from '../theme/presets'
import { ConfirmDialog } from './ConfirmDialog'

type Props = {
  onClose: () => void
}

const COLOR_FIELDS: { key: keyof ThemeColors; label: string }[] = [
  { key: 'bg', label: 'Hintergrund' },
  { key: 'panel', label: 'Panel' },
  { key: 'panelAlt', label: 'Nebenpanel' },
  { key: 'border', label: 'Rahmen' },
  { key: 'text', label: 'Text' },
  { key: 'muted', label: 'Gedaempft' },
  { key: 'accent', label: 'Akzent' },
  { key: 'danger', label: 'Gefahr' },
]

export function ThemeModal({ onClose }: Props) {
  const themes = useStore((s) => s.settings.themes)
  const currentThemeId = useStore((s) => s.settings.currentThemeId)
  const setCurrentTheme = useStore((s) => s.setCurrentTheme)
  const createCustomTheme = useStore((s) => s.createCustomTheme)
  const renameTheme = useStore((s) => s.renameTheme)
  const deleteTheme = useStore((s) => s.deleteTheme)
  const updateThemeColor = useStore((s) => s.updateThemeColor)

  const current = themes.find((t) => t.id === currentThemeId) ?? themes[0]
  const [selectedKey, setSelectedKey] = useState<keyof ThemeColors>('accent')
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(current?.name ?? '')
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    setRenaming(false)
    setRenameValue(current?.name ?? '')
  }, [current?.id, current?.name])

  const selectedValue = current?.colors[selectedKey] ?? '#000000'
  const hsva = useMemo(() => hexToHsva(selectedValue), [selectedValue])

  if (!current) return null

  const customCount = themes.filter((t) => !t.builtIn).length
  const canCreate = customCount < MAX_CUSTOM_THEMES
  const isBuiltIn = current.builtIn

  const commitColor = (hex: string) => {
    if (isBuiltIn) return
    updateThemeColor(current.id, selectedKey, hex)
  }

  const onCreate = () => {
    const newId = createCustomTheme(current.id)
    if (newId) {
      setRenaming(true)
    }
  }

  const onDelete = () => {
    if (isBuiltIn) return
    setPendingDelete({ id: current.id, name: current.name })
  }

  const commitRename = () => {
    if (renameValue.trim()) {
      renameTheme(current.id, renameValue.trim())
    }
    setRenaming(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(620px, 94vw)', maxWidth: 620 }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--accent-hover)', flex: 1 }}>
            Farben und Templates
          </div>
          <button
            className="icon-btn"
            title="Schliessen"
            onClick={onClose}
            style={{ width: 26, height: 26 }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 6,
            marginBottom: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          {renaming && !isBuiltIn ? (
            <input
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename()
                if (e.key === 'Escape') {
                  setRenameValue(current.name)
                  setRenaming(false)
                }
              }}
              style={{
                flex: 1,
                minWidth: 160,
                background: 'var(--panel-alt)',
                color: 'var(--text)',
                border: '1px solid var(--accent)',
                borderRadius: 6,
                padding: '0.45em 0.6em',
                fontSize: 'inherit',
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
          ) : (
            <select
              className="dreamselect"
              value={currentThemeId}
              onChange={(e) => setCurrentTheme(e.target.value)}
              style={{ flex: 1, minWidth: 160 }}
            >
              {themes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.builtIn ? `${t.name} (Vorlage)` : t.name}
                </option>
              ))}
            </select>
          )}
          <button
            className="btn"
            onClick={() => {
              if (isBuiltIn) return
              setRenameValue(current.name)
              setRenaming(true)
            }}
            disabled={isBuiltIn}
            style={{
              borderColor: 'var(--border)',
              opacity: isBuiltIn ? 0.5 : 1,
              cursor: isBuiltIn ? 'not-allowed' : 'pointer',
            }}
            title={isBuiltIn ? 'Vorlagen koennen nicht umbenannt werden' : 'Umbenennen'}
          >
            Umbenennen
          </button>
          <button
            className="btn"
            onClick={onDelete}
            disabled={isBuiltIn}
            style={{
              borderColor: 'var(--border)',
              opacity: isBuiltIn ? 0.5 : 1,
              cursor: isBuiltIn ? 'not-allowed' : 'pointer',
              color: isBuiltIn ? undefined : 'var(--danger)',
            }}
            title={isBuiltIn ? 'Vorlagen koennen nicht geloescht werden' : 'Loeschen'}
          >
            Loeschen
          </button>
          <button
            className="btn"
            onClick={onCreate}
            disabled={!canCreate}
            style={{
              borderColor: canCreate ? 'var(--accent)' : 'var(--border)',
              color: canCreate ? 'var(--accent)' : 'var(--muted)',
              opacity: canCreate ? 1 : 0.5,
              cursor: canCreate ? 'pointer' : 'not-allowed',
            }}
            title={
              canCreate
                ? 'Neues Template (Kopie vom aktuellen)'
                : `Maximum von ${MAX_CUSTOM_THEMES} eigenen Templates erreicht`
            }
          >
            + Neu
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 6,
            marginBottom: 12,
          }}
        >
          {COLOR_FIELDS.map((f) => {
            const active = selectedKey === f.key
            const val = current.colors[f.key]
            return (
              <button
                key={f.key}
                onClick={() => setSelectedKey(f.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '0.45em 0.6em',
                  background: active ? 'var(--accent-soft)' : 'var(--panel-alt)',
                  border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 8,
                  cursor: 'pointer',
                  color: 'var(--text)',
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  textAlign: 'left',
                  transition: 'background 120ms, border-color 120ms',
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: val,
                    border: '1px solid var(--border)',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)',
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, minWidth: 0 }}>{f.label}</span>
                <span
                  style={{
                    color: 'var(--muted)',
                    fontSize: '0.82em',
                    fontFamily: 'monospace',
                  }}
                >
                  {val.toUpperCase()}
                </span>
              </button>
            )
          })}
        </div>

        {isBuiltIn ? (
          <div
            style={{
              padding: '0.7em 0.9em',
              background: 'var(--panel-alt)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--muted)',
              fontSize: '0.9em',
              marginBottom: 8,
            }}
          >
            Vorlage kann nicht bearbeitet werden. Erstelle mit "+ Neu" ein eigenes Template.
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              padding: '0.8em',
              background: 'var(--panel-alt)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              marginBottom: 8,
              flexWrap: 'wrap',
            }}
          >
            <Wheel
              color={hsva}
              onChange={(c) => commitColor(hsvaToHex(c.hsva))}
              width={170}
              height={170}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                flex: 1,
                minWidth: 180,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.82em',
                    color: 'var(--muted)',
                    marginBottom: 4,
                  }}
                >
                  Helligkeit
                </div>
                <ShadeSlider
                  hsva={hsva}
                  onChange={(n) => commitColor(hsvaToHex({ ...hsva, ...n }))}
                  width={'100%'}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: selectedValue,
                    border: '1px solid var(--border)',
                    flexShrink: 0,
                  }}
                />
                <input
                  type="text"
                  value={selectedValue}
                  onChange={(e) => {
                    const v = e.target.value.trim()
                    if (/^#?[0-9a-fA-F]{6}$/.test(v)) {
                      commitColor(v.startsWith('#') ? v : `#${v}`)
                    } else if (/^#?[0-9a-fA-F]{3}$/.test(v)) {
                      const clean = v.replace('#', '')
                      commitColor(
                        `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`,
                      )
                    }
                  }}
                  spellCheck={false}
                  style={{
                    flex: 1,
                    background: 'var(--panel)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    borderRadius: 6,
                    padding: '0.4em 0.55em',
                    fontFamily: 'monospace',
                    fontSize: 'inherit',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 6,
          }}
        >
          <div style={{ color: 'var(--muted)', fontSize: '0.82em' }}>
            Eigene Templates: {customCount} / {MAX_CUSTOM_THEMES}
          </div>
          <button className="btn" onClick={onClose} style={{ borderColor: 'var(--border)' }}>
            Schliessen
          </button>
        </div>
      </div>
      <ConfirmDialog
        open={!!pendingDelete}
        title="Template loeschen"
        message={
          pendingDelete ? `Template "${pendingDelete.name}" loeschen?` : ''
        }
        danger
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) deleteTheme(pendingDelete.id)
          setPendingDelete(null)
        }}
      />
    </div>
  )
}
