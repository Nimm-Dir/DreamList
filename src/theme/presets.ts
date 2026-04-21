import type { Theme } from '../types'

export const PRESET_DARK: Theme = {
  id: 'preset-dark',
  name: 'Dream Dark',
  builtIn: true,
  colors: {
    bg: '#0b1114',
    panel: '#111a1e',
    panelAlt: '#0d1619',
    border: '#1e2d33',
    text: '#e6edef',
    muted: '#8a9aa0',
    accent: '#0d9488',
    danger: '#ef4444',
  },
}

export const PRESET_LIGHT: Theme = {
  id: 'preset-light',
  name: 'Dream Light',
  builtIn: true,
  colors: {
    bg: '#f7f8fa',
    panel: '#ffffff',
    panelAlt: '#eef1f5',
    border: '#d6dde3',
    text: '#1b2328',
    muted: '#6b7780',
    accent: '#0d9488',
    danger: '#dc2626',
  },
}

export const PRESET_LARRYS_DREAM: Theme = {
  id: 'preset-larrys-dream',
  name: 'LarrysDream',
  builtIn: true,
  colors: {
    bg: '#F8F9FA',
    panel: '#FFFFFF',
    panelAlt: '#F1F3F5',
    border: '#D4AF37',
    text: '#2D1C59',
    muted: '#6C757D',
    accent: '#7A5FFF',
    danger: '#DC2626',
  },
}

export const DEFAULT_THEMES: Theme[] = [PRESET_DARK, PRESET_LIGHT, PRESET_LARRYS_DREAM]
export const DEFAULT_THEME_ID = PRESET_DARK.id
export const MAX_CUSTOM_THEMES = 5
