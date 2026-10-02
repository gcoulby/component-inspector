import type { ManifestEntry } from '@/types/project'

// Seeds every new project so components match against something on first
// detection — an empty manifest means every component starts unmatched
// (amber), which reads as "no colour variety." Ported verbatim from the PoC.
function entry(name: string, keywords: string[]): ManifestEntry {
  return { name, keywords, description: '', url: '', screenshotAssetId: null }
}

export const DEFAULT_MANIFEST: ManifestEntry[] = [
  entry('button.tsx', ['button', 'btn']),
  entry('select.tsx', ['select', 'dropdown']),
  entry('textarea.tsx', ['textarea', 'message-input']),
  entry('badge.tsx', ['badge', 'chip', 'tag', 'pill']),
  entry('status-cards.tsx', ['status-card', 'stat', 'metric']),
  entry('tabbed-card.tsx', ['tab', 'tabbed']),
  entry('data-table.tsx', ['table', 'data-table', 'row']),
  entry('field.tsx', ['field', 'form-row']),
]
