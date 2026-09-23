import type { ComponentCategory } from '@/types/project'

export const CATEGORY_BADGES: Record<ComponentCategory, string> = {
  new: '⭐ New',
  undocumented: '🌸 Existing, undocumented',
  matched: '✅ Matched',
  unmatched: '❔ Unreviewed',
}

export const CATEGORY_OPTIONS: { value: ComponentCategory; label: string }[] = [
  { value: 'new', label: 'New ⭐' },
  { value: 'undocumented', label: "Undoc'd 🌸" },
  { value: 'matched', label: 'Matched ✅' },
]

interface CategoryStyle {
  dot: string
  border: string
  bg: string
}

// Matches the PoC's palette exactly: new=pink, undocumented=blue,
// matched=green, unmatched=amber/gold (the default until something is
// matched or manually reviewed — never blue, or everything looks the same).
export const CATEGORY_STYLES: Record<ComponentCategory, CategoryStyle> = {
  new: { dot: 'bg-pink-400', border: 'border-pink-400', bg: 'bg-pink-400/25' },
  undocumented: { dot: 'bg-sky-400', border: 'border-sky-400', bg: 'bg-sky-400/25' },
  matched: { dot: 'bg-emerald-400', border: 'border-emerald-400', bg: 'bg-emerald-400/25' },
  unmatched: { dot: 'bg-amber-500', border: 'border-amber-500', bg: 'bg-amber-500/25' },
}
