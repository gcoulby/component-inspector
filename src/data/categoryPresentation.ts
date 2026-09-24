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
  tag: string
}

// The PoC's exact --new/--undoc/--matched/--unmatched tokens (see
// tailwind.config.ts), not the nearest Tailwind-named color — unmatched is
// the default until something is matched or manually reviewed.
export const CATEGORY_STYLES: Record<ComponentCategory, CategoryStyle> = {
  new: { dot: 'bg-cat-new', border: 'border-cat-new', bg: 'bg-cat-new/15', tag: 'bg-cat-new text-[#1a0a12]' },
  undocumented: {
    dot: 'bg-cat-undocumented',
    border: 'border-cat-undocumented',
    bg: 'bg-cat-undocumented/15',
    tag: 'bg-cat-undocumented text-[#04121f]',
  },
  matched: {
    dot: 'bg-cat-matched',
    border: 'border-cat-matched',
    bg: 'bg-cat-matched/15',
    tag: 'bg-cat-matched text-[#04140c]',
  },
  unmatched: {
    dot: 'bg-cat-unmatched',
    border: 'border-cat-unmatched',
    bg: 'bg-cat-unmatched/16',
    tag: 'bg-cat-unmatched text-[#1a1404]',
  },
}
