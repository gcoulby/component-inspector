import type { ComponentCategory } from '@/types/project'

export const CATEGORY_BADGES: Record<ComponentCategory, string> = {
  new: '⭐ New',
  undocumented: '🌸 Existing, undocumented',
  matched: '✅ Matched',
  unmatched: '❔ Unreviewed',
}

// The status indicator — box color is uniqueness (per component), never
// status, so this icon is the only place status shows up on the canvas.
export const CATEGORY_ICONS: Record<ComponentCategory, string> = {
  new: '⭐',
  undocumented: '🌸',
  matched: '✅',
  unmatched: '❔',
}

export const CATEGORY_OPTIONS: { value: ComponentCategory; label: string }[] = [
  { value: 'new', label: 'New ⭐' },
  { value: 'undocumented', label: "Undoc'd 🌸" },
  { value: 'matched', label: 'Matched ✅' },
]
