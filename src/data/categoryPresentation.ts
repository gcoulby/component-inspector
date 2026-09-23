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

export const CATEGORY_STYLES: Record<ComponentCategory, CategoryStyle> = {
  new: { dot: 'bg-amber-400', border: 'border-amber-400', bg: 'bg-amber-400/10' },
  undocumented: { dot: 'bg-pink-400', border: 'border-pink-400', bg: 'bg-pink-400/10' },
  matched: { dot: 'bg-emerald-400', border: 'border-emerald-400', bg: 'bg-emerald-400/10' },
  unmatched: { dot: 'bg-slate-400', border: 'border-slate-400', bg: 'bg-slate-400/10' },
}
