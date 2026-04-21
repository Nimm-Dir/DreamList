import { create } from 'zustand'
import type { Data, FontSize, Project, Settings, Task, Theme, ThemeColors } from '../types'
import { DEFAULT_THEMES, DEFAULT_THEME_ID, MAX_CUSTOM_THEMES, PRESET_DARK } from '../theme/presets'
import { applyTheme } from '../theme/applyTheme'

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

export function autoBullet(text: string): string {
  return text.replace(/(^|\n)- (?!\s)/g, '$1• ')
}

export function todayIso(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const defaultSettings: Settings = {
  fontSize: 'medium',
  splitRatio: 0.5,
  currentProjectId: null,
  expandedNodes: {},
  sidebarCollapsed: false,
  alwaysOnTop: false,
  themes: DEFAULT_THEMES,
  currentThemeId: DEFAULT_THEME_ID,
  window: null,
}

type StoreState = {
  projects: Project[]
  settings: Settings
  hydrated: boolean

  past: Project[][]
  future: Project[][]

  pushHistory: (snapshot: Project[]) => void
  withProjectUndo: (fn: () => void) => void
  undo: () => void
  redo: () => void

  init: () => Promise<void>
  persist: () => void

  setCurrentProject: (id: string) => void
  createProject: (name?: string) => string
  renameProject: (id: string, name: string) => void
  deleteProject: (id: string) => void
  reorderProjects: (orderedIds: string[]) => void

  currentProject: () => Project | undefined
  getTasks: () => Task[]

  addTask: (text: string) => void
  updateTaskText: (id: string, text: string) => void
  deleteTask: (id: string) => void

  assignDate: (id: string, date: string | null) => void

  reorderOpen: (orderedIds: string[]) => void
  reorderDate: (date: string, orderedIds: string[]) => void

  setFontSize: (s: FontSize) => void
  setSplitRatio: (r: number) => void
  setExpanded: (key: string, value: boolean) => void
  toggleExpanded: (key: string) => void
  toggleSidebar: () => void
  toggleAlwaysOnTop: () => void

  setCurrentTheme: (id: string) => void
  createCustomTheme: (fromId?: string) => string
  renameTheme: (id: string, name: string) => void
  deleteTheme: (id: string) => void
  updateThemeColor: (id: string, key: keyof ThemeColors, value: string) => void
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.order - b.order || a.createdAt - b.createdAt)
}

const MAX_HISTORY = 20

let preloadPromise: Promise<Data | null> | null = null

export function preloadData(): Promise<Data | null> {
  if (preloadPromise) return preloadPromise
  const api = window.dreamlist
  preloadPromise = api ? api.load() : Promise.resolve(null)
  return preloadPromise
}

export const useStore = create<StoreState>((set, get) => ({
  projects: [],
  settings: defaultSettings,
  hydrated: false,

  past: [],
  future: [],

  pushHistory: (snapshot) => {
    set((s) => ({
      past: [...s.past, snapshot].slice(-MAX_HISTORY),
      future: [],
    }))
  },
  withProjectUndo: (fn) => {
    const before = structuredClone(get().projects)
    fn()
    if (JSON.stringify(before) !== JSON.stringify(get().projects)) {
      get().pushHistory(before)
    }
  },
  undo: () => {
    const s = get()
    if (s.past.length === 0) return
    const prev = s.past[s.past.length - 1]
    set({
      past: s.past.slice(0, -1),
      future: [...s.future, s.projects].slice(-MAX_HISTORY),
      projects: prev,
    })
    get().persist()
  },
  redo: () => {
    const s = get()
    if (s.future.length === 0) return
    const next = s.future[s.future.length - 1]
    set({
      future: s.future.slice(0, -1),
      past: [...s.past, s.projects].slice(-MAX_HISTORY),
      projects: next,
    })
    get().persist()
  },

  init: async () => {
    const loaded = await preloadData()
    const data: Data = loaded ?? {
      projects: [{ id: 'default', name: 'Allgemein', tasks: [] }],
      settings: { ...defaultSettings, currentProjectId: 'default' },
    }
    const settings = { ...defaultSettings, ...data.settings }
    if (!settings.currentProjectId || !data.projects.find((p) => p.id === settings.currentProjectId)) {
      settings.currentProjectId = data.projects[0]?.id ?? null
    }
    if (!settings.themes || settings.themes.length === 0) {
      settings.themes = DEFAULT_THEMES
    } else {
      const hasDark = settings.themes.some((t) => t.id === 'preset-dark')
      const hasLight = settings.themes.some((t) => t.id === 'preset-light')
      const hasLarry = settings.themes.some((t) => t.id === 'preset-larrys-dream')
      if (!hasDark || !hasLight || !hasLarry) {
        const missing = DEFAULT_THEMES.filter(
          (t) => !settings.themes.some((x) => x.id === t.id),
        )
        settings.themes = [...settings.themes, ...missing]
      }
      settings.themes = settings.themes.map((t) => {
        if (t.id === 'preset-dark') return { ...t, name: 'Dream Dark', builtIn: true }
        if (t.id === 'preset-light') return { ...t, name: 'Dream Light', builtIn: true }
        if (t.id === 'preset-larrys-dream') return { ...t, name: 'LarrysDream', builtIn: true }
        return t
      })
      const presetOrder = DEFAULT_THEMES.map((t) => t.id)
      const builtins = presetOrder
        .map((id) => settings.themes.find((t) => t.id === id))
        .filter((t): t is Theme => Boolean(t))
      const customs = settings.themes.filter((t) => !presetOrder.includes(t.id))
      settings.themes = [...builtins, ...customs]
    }
    if (!settings.currentThemeId || !settings.themes.find((t) => t.id === settings.currentThemeId)) {
      settings.currentThemeId = DEFAULT_THEME_ID
    }
    set({ projects: data.projects, settings, hydrated: true })
    const active = settings.themes.find((t) => t.id === settings.currentThemeId) ?? PRESET_DARK
    applyTheme(active.colors)
    if (settings.alwaysOnTop) {
      window.dreamlist?.setAlwaysOnTop(true)
    }
  },

  persist: () => {
    const { projects, settings } = get()
    window.dreamlist?.save({ projects, settings })
  },

  setCurrentProject: (id) => {
    set((s) => ({ settings: { ...s.settings, currentProjectId: id } }))
    get().persist()
  },

  createProject: (name) => {
    const newProj: Project = { id: uid(), name: name?.trim() || 'Neue Liste', tasks: [] }
    set((s) => ({
      projects: [...s.projects, newProj],
      settings: { ...s.settings, currentProjectId: newProj.id },
    }))
    get().persist()
    return newProj.id
  },

  renameProject: (id, name) => {
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, name: name.trim() || p.name } : p)),
    }))
    get().persist()
  },

  deleteProject: (id) => {
    set((s) => {
      const remaining = s.projects.filter((p) => p.id !== id)
      const projects = remaining.length > 0 ? remaining : [{ id: uid(), name: 'Allgemein', tasks: [] }]
      const currentProjectId =
        s.settings.currentProjectId === id ? projects[0].id : s.settings.currentProjectId
      return { projects, settings: { ...s.settings, currentProjectId } }
    })
    get().persist()
  },

  reorderProjects: (orderedIds) => {
    set((s) => {
      const byId = new Map(s.projects.map((p) => [p.id, p]))
      const reordered = orderedIds.map((id) => byId.get(id)).filter((p): p is Project => !!p)
      const missing = s.projects.filter((p) => !orderedIds.includes(p.id))
      return { projects: [...reordered, ...missing] }
    })
    get().persist()
  },

  currentProject: () => {
    const { projects, settings } = get()
    return projects.find((p) => p.id === settings.currentProjectId)
  },

  getTasks: () => get().currentProject()?.tasks ?? [],

  addTask: (text) => {
    const trimmed = text.trimEnd()
    if (!trimmed) return
    set((s) => {
      const pid = s.settings.currentProjectId
      if (!pid) return s
      const minOrder = Math.min(0, ...s.projects.find((p) => p.id === pid)!.tasks
        .filter((t) => t.date === null)
        .map((t) => t.order))
      const newTask: Task = {
        id: uid(),
        text: trimmed,
        date: null,
        createdAt: Date.now(),
        order: minOrder - 1,
      }
      return {
        projects: s.projects.map((p) =>
          p.id === pid ? { ...p, tasks: [...p.tasks, newTask] } : p,
        ),
      }
    })
    get().persist()
  },

  updateTaskText: (id, text) => {
    get().withProjectUndo(() => {
      const trimmed = text.trimEnd()
      if (!trimmed) {
        get().deleteTask(id)
        return
      }
      set((s) => ({
        projects: s.projects.map((p) => ({
          ...p,
          tasks: p.tasks.map((t) => (t.id === id ? { ...t, text: trimmed } : t)),
        })),
      }))
      get().persist()
    })
  },

  deleteTask: (id) => {
    set((s) => ({
      projects: s.projects.map((p) => ({
        ...p,
        tasks: p.tasks.filter((t) => t.id !== id),
      })),
    }))
    get().persist()
  },

  assignDate: (id, date) => {
    set((s) => {
      const pid = s.settings.currentProjectId
      if (!pid) return s
      return {
        projects: s.projects.map((p) => {
          if (p.id !== pid) return p
          const targetTasks = p.tasks.filter((t) => t.date === date && t.id !== id)
          let newOrder: number
          if (date === null) {
            const minOrder = targetTasks.length > 0 ? Math.min(...targetTasks.map((t) => t.order)) : 0
            newOrder = minOrder - 1
          } else {
            const maxOrder = targetTasks.length > 0 ? Math.max(...targetTasks.map((t) => t.order)) : 0
            newOrder = maxOrder + 1
          }
          return {
            ...p,
            tasks: p.tasks.map((t) => (t.id === id ? { ...t, date, order: newOrder } : t)),
          }
        }),
      }
    })
    get().persist()
  },

  reorderOpen: (orderedIds) => {
    set((s) => {
      const pid = s.settings.currentProjectId
      if (!pid) return s
      return {
        projects: s.projects.map((p) => {
          if (p.id !== pid) return p
          const orderMap = new Map(orderedIds.map((id, i) => [id, i]))
          return {
            ...p,
            tasks: p.tasks.map((t) =>
              t.date === null && orderMap.has(t.id) ? { ...t, order: orderMap.get(t.id)! } : t,
            ),
          }
        }),
      }
    })
    get().persist()
  },

  reorderDate: (date, orderedIds) => {
    set((s) => {
      const pid = s.settings.currentProjectId
      if (!pid) return s
      return {
        projects: s.projects.map((p) => {
          if (p.id !== pid) return p
          const orderMap = new Map(orderedIds.map((id, i) => [id, i]))
          return {
            ...p,
            tasks: p.tasks.map((t) =>
              t.date === date && orderMap.has(t.id) ? { ...t, order: orderMap.get(t.id)! } : t,
            ),
          }
        }),
      }
    })
    get().persist()
  },

  setFontSize: (fontSize) => {
    set((s) => ({ settings: { ...s.settings, fontSize } }))
    get().persist()
  },

  setSplitRatio: (r) => {
    const clamped = Math.min(0.9, Math.max(0.1, r))
    set((s) => ({ settings: { ...s.settings, splitRatio: clamped } }))
    get().persist()
  },

  setExpanded: (key, value) => {
    set((s) => ({
      settings: { ...s.settings, expandedNodes: { ...s.settings.expandedNodes, [key]: value } },
    }))
    get().persist()
  },

  toggleExpanded: (key) => {
    const current = get().settings.expandedNodes[key] ?? false
    get().setExpanded(key, !current)
  },

  toggleSidebar: () => {
    set((s) => ({ settings: { ...s.settings, sidebarCollapsed: !s.settings.sidebarCollapsed } }))
    get().persist()
  },

  toggleAlwaysOnTop: () => {
    const next = !get().settings.alwaysOnTop
    set((s) => ({ settings: { ...s.settings, alwaysOnTop: next } }))
    window.dreamlist?.setAlwaysOnTop(next)
    get().persist()
  },

  setCurrentTheme: (id) => {
    const theme = get().settings.themes.find((t) => t.id === id)
    if (!theme) return
    set((s) => ({ settings: { ...s.settings, currentThemeId: id } }))
    applyTheme(theme.colors)
    get().persist()
  },

  createCustomTheme: (fromId) => {
    const state = get()
    const customCount = state.settings.themes.filter((t) => !t.builtIn).length
    if (customCount >= MAX_CUSTOM_THEMES) return ''
    const base =
      state.settings.themes.find((t) => t.id === (fromId ?? state.settings.currentThemeId)) ??
      PRESET_DARK
    const existingNames = new Set(state.settings.themes.map((t) => t.name))
    let n = 1
    let name = `Template ${n}`
    while (existingNames.has(name)) {
      n++
      name = `Template ${n}`
    }
    const newTheme: Theme = {
      id: uid(),
      name,
      builtIn: false,
      colors: { ...base.colors },
    }
    set((s) => ({
      settings: {
        ...s.settings,
        themes: [...s.settings.themes, newTheme],
        currentThemeId: newTheme.id,
      },
    }))
    applyTheme(newTheme.colors)
    get().persist()
    return newTheme.id
  },

  renameTheme: (id, name) => {
    set((s) => ({
      settings: {
        ...s.settings,
        themes: s.settings.themes.map((t) =>
          t.id === id && !t.builtIn ? { ...t, name: name.trim() || t.name } : t,
        ),
      },
    }))
    get().persist()
  },

  deleteTheme: (id) => {
    set((s) => {
      const target = s.settings.themes.find((t) => t.id === id)
      if (!target || target.builtIn) return s
      const remaining = s.settings.themes.filter((t) => t.id !== id)
      const nextId =
        s.settings.currentThemeId === id ? DEFAULT_THEME_ID : s.settings.currentThemeId
      const active = remaining.find((t) => t.id === nextId) ?? PRESET_DARK
      applyTheme(active.colors)
      return {
        settings: {
          ...s.settings,
          themes: remaining,
          currentThemeId: nextId,
        },
      }
    })
    get().persist()
  },

  updateThemeColor: (id, key, value) => {
    set((s) => {
      const theme = s.settings.themes.find((t) => t.id === id)
      if (!theme || theme.builtIn) return s
      const nextTheme: Theme = { ...theme, colors: { ...theme.colors, [key]: value } }
      const themes = s.settings.themes.map((t) => (t.id === id ? nextTheme : t))
      if (s.settings.currentThemeId === id) {
        applyTheme(nextTheme.colors)
      }
      return { settings: { ...s.settings, themes } }
    })
    get().persist()
  },
}))

export { sortTasks }
