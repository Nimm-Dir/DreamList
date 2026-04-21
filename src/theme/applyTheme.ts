import type { ThemeColors } from '../types'

function clampHex(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)))
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.trim().replace(/^#/, '')
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16)
    const g = parseInt(h[1] + h[1], 16)
    const b = parseInt(h[2] + h[2], 16)
    return { r, g, b }
  }
  const r = parseInt(h.slice(0, 2), 16) || 0
  const g = parseInt(h.slice(2, 4), 16) || 0
  const b = parseInt(h.slice(4, 6), 16) || 0
  return { r, g, b }
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break
      case gn: h = (bn - rn) / d + 2; break
      case bn: h = (rn - gn) / d + 4; break
    }
    h *= 60
  }
  return { h, s, l }
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hh = ((h % 360) + 360) % 360 / 60
  const x = c * (1 - Math.abs((hh % 2) - 1))
  let r = 0, g = 0, b = 0
  if (hh < 1) { r = c; g = x; b = 0 }
  else if (hh < 2) { r = x; g = c; b = 0 }
  else if (hh < 3) { r = 0; g = c; b = x }
  else if (hh < 4) { r = 0; g = x; b = c }
  else if (hh < 5) { r = x; g = 0; b = c }
  else { r = c; g = 0; b = x }
  const m = l - c / 2
  return { r: clampHex((r + m) * 255), g: clampHex((g + m) * 255), b: clampHex((b + m) * 255) }
}

function toHex(r: number, g: number, b: number): string {
  const h = (n: number) => clampHex(n).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}

export function lighten(hex: string, percent: number): string {
  const { r, g, b } = parseHex(hex)
  const { h, s, l } = rgbToHsl(r, g, b)
  const nl = Math.max(0, Math.min(1, l + percent / 100))
  const { r: nr, g: ng, b: nb } = hslToRgb(h, s, nl)
  return toHex(nr, ng, nb)
}

export function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = parseHex(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function isLightColor(hex: string): boolean {
  const { r, g, b } = parseHex(hex)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55
}

export function applyTheme(c: ThemeColors): void {
  const r = document.documentElement
  r.style.setProperty('--bg', c.bg)
  r.style.setProperty('--panel', c.panel)
  r.style.setProperty('--panel-alt', c.panelAlt)
  r.style.setProperty('--border', c.border)
  r.style.setProperty('--text', c.text)
  r.style.setProperty('--muted', c.muted)
  r.style.setProperty('--accent', c.accent)
  r.style.setProperty('--accent-hover', lighten(c.accent, 10))
  r.style.setProperty('--accent-soft', withAlpha(c.accent, 0.14))
  r.style.setProperty('--danger', c.danger)
  r.dataset.theme = isLightColor(c.bg) ? 'light' : 'dark'
}
