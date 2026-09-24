import type { ManifestEntry } from '@/types/project'

// Seeds every new project so components match against something on first
// detection — an empty manifest means every component starts unmatched
// (amber), which reads as "no colour variety." Ported verbatim from the PoC.
export const DEFAULT_MANIFEST: ManifestEntry[] = [
  { name: 'button.tsx', keywords: ['button', 'btn'] },
  { name: 'select.tsx', keywords: ['select', 'dropdown'] },
  { name: 'textarea.tsx', keywords: ['textarea', 'message-input'] },
  { name: 'badge.tsx', keywords: ['badge', 'chip', 'tag', 'pill'] },
  { name: 'status-cards.tsx', keywords: ['status-card', 'stat', 'metric'] },
  { name: 'tabbed-card.tsx', keywords: ['tab', 'tabbed'] },
  { name: 'data-table.tsx', keywords: ['table', 'data-table', 'row'] },
  { name: 'field.tsx', keywords: ['field', 'form-row'] },
]
