import type { DetectionCategory } from '@/types/project'

export type DetectionFilters = Record<DetectionCategory, boolean>

// Filters default to showing everything except raw buttons and nav — those
// tend to be noisy on first pass.
export const DEFAULT_FILTERS: DetectionFilters = {
  button: false,
  nav: false,
  field: true,
  table: true,
  badge: true,
  other: true,
}

export const FILTER_LABELS: Record<DetectionCategory, string> = {
  button: 'Buttons',
  nav: 'Nav & tabs',
  field: 'Fields',
  table: 'Tables',
  badge: 'Badges',
  other: 'Other',
}

export const INTERESTING_TAGS = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'TABLE']

export const KEYWORDS = [
  'btn', 'button', 'card', 'badge', 'chip', 'stepper', 'tab', 'modal', 'dialog',
  'dropzone', 'upload', 'toggle', 'switch', 'checkbox', 'radio', 'avatar', 'tag', 'pill', 'nav',
  'sidebar', 'panel', 'banner', 'tooltip', 'breadcrumb', 'pagination', 'progress', 'spinner',
  'accordion', 'field', 'select', 'dropdown', 'table', 'status', 'list-item',
]

export const CATEGORY_KEYWORDS: Record<Exclude<DetectionCategory, 'other'>, string[]> = {
  button: ['btn', 'button'],
  nav: ['nav', 'sidebar', 'breadcrumb', 'tab', 'pagination'],
  field: ['field', 'dropdown', 'select', 'toggle', 'switch', 'checkbox', 'radio'],
  table: ['table', 'list-item', 'row'],
  badge: ['badge', 'chip', 'tag', 'pill', 'status'],
}

export const VIEW_TITLE_SELECTORS = [
  'h1', 'h2', 'h3', '.title', '.card-title', '.panel-title', '.step-title', '[class*="title" i]',
]
