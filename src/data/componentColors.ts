import type { ProjectComponent } from '@/types/project'

// Vivid, high-contrast against the dark canvas background — distinct enough
// from each other to tell components apart at a glance across a screenshot.
export const COMPONENT_COLOR_PALETTE: string[] = [
  '#ff2f92',
  '#22c55e',
  '#06b6d4',
  '#f59e0b',
  '#8b5cf6',
  '#3b82f6',
  '#ef4444',
  '#eab308',
  '#14b8a6',
  '#f97316',
  '#a3e635',
  '#ec4899',
  '#60a5fa',
  '#c084fc',
]

// Picks the first palette color not already in use by another component, so
// every new component gets a visually distinct box color automatically.
// Once the palette is exhausted, colors repeat rather than running out.
export function pickComponentColor(existing: ProjectComponent[]): string {
  const used = new Set(existing.map((c) => c.color))
  const free = COMPONENT_COLOR_PALETTE.find((hex) => !used.has(hex))
  if (free) return free
  return COMPONENT_COLOR_PALETTE[existing.length % COMPONENT_COLOR_PALETTE.length]
}

export function contrastTextColor(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.55 ? '#0a0a0a' : '#f5f5f5'
}
