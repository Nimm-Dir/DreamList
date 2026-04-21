export type Task = {
  id: string
  text: string
  date: string | null
  createdAt: number
  order: number
}

export type Project = { id: string; name: string; tasks: Task[] }

export type FontSize = 'small' | 'medium' | 'large'

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
  fontSize: FontSize
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

declare global {
  interface Window {
    dreamlist?: {
      load: () => Promise<Data>
      save: (data: Data) => Promise<boolean>
      setAlwaysOnTop: (value: boolean) => Promise<boolean>
    }
  }
}
