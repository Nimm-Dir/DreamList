import { app } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'

export type Task = {
  id: string
  text: string
  date: string | null
  createdAt: number
  order: number
}

export type Project = { id: string; name: string; tasks: Task[] }

export type ThemeColors = {
  bg: string
  panel: string
  panelAlt: string
  border: string
  text: string
  muted: string
  accent: string
  danger: string
}

export type Theme = {
  id: string
  name: string
  colors: ThemeColors
  builtIn: boolean
}

export type Settings = {
  fontSize: 'small' | 'medium' | 'large'
  splitRatio: number
  currentProjectId: string | null
  expandedNodes: Record<string, boolean>
  sidebarCollapsed: boolean
  alwaysOnTop: boolean
  themes: Theme[]
  currentThemeId: string
  window: { x?: number; y?: number; width: number; height: number } | null
}

export type Data = { projects: Project[]; settings: Settings }

const DARK_THEME: Theme = {
  id: 'preset-dark',
  name: 'Dream Dark',
  builtIn: true,
  colors: {
    bg: '#0b1114', panel: '#111a1e', panelAlt: '#0d1619',
    border: '#1e2d33', text: '#e6edef', muted: '#8a9aa0',
    accent: '#0d9488', danger: '#ef4444',
  },
}
const LIGHT_THEME: Theme = {
  id: 'preset-light',
  name: 'Dream Light',
  builtIn: true,
  colors: {
    bg: '#f7f8fa', panel: '#ffffff', panelAlt: '#eef1f5',
    border: '#d6dde3', text: '#1b2328', muted: '#6b7780',
    accent: '#0d9488', danger: '#dc2626',
  },
}

const defaultData: Data = {
  projects: [{ id: 'default', name: 'Allgemein', tasks: [] }],
  settings: {
    fontSize: 'medium',
    splitRatio: 0.5,
    currentProjectId: 'default',
    expandedNodes: {},
    sidebarCollapsed: false,
    alwaysOnTop: false,
    themes: [DARK_THEME, LIGHT_THEME],
    currentThemeId: DARK_THEME.id,
    window: null,
  },
}

function dataPath(): string {
  return path.join(app.getPath('userData'), 'data.json')
}

export async function loadData(): Promise<Data> {
  try {
    const text = await fs.readFile(dataPath(), 'utf-8')
    const parsed = JSON.parse(text) as Partial<Data>
    return {
      projects: parsed.projects && parsed.projects.length > 0 ? parsed.projects : defaultData.projects,
      settings: { ...defaultData.settings, ...(parsed.settings ?? {}) },
    }
  } catch {
    return structuredClone(defaultData)
  }
}

let saveTimer: NodeJS.Timeout | null = null
let pendingData: Data | null = null

export function saveData(data: Data): void {
  pendingData = data
  if (saveTimer) return
  saveTimer = setTimeout(async () => {
    const toSave = pendingData
    pendingData = null
    saveTimer = null
    if (!toSave) return
    try {
      await fs.mkdir(path.dirname(dataPath()), { recursive: true })
      await fs.writeFile(dataPath(), JSON.stringify(toSave, null, 2), 'utf-8')
    } catch (e) {
      console.error('saveData failed', e)
    }
  }, 150)
}

export async function patchWindow(bounds: NonNullable<Settings['window']>): Promise<void> {
  const data = await loadData()
  data.settings.window = bounds
  saveData(data)
}
