import type { Block, DetectionCategory } from '@/types/project'
import {
  CATEGORY_KEYWORDS,
  INTERESTING_TAGS,
  KEYWORDS,
  type DetectionFilters,
} from '@/data/detectionHeuristics'

function titleCase(s: string): string {
  return s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function classesOf(node: Element): string {
  return typeof node.className === 'string' ? node.className : ''
}

function dataComponentOf(node: Element): string | undefined {
  return node instanceof HTMLElement ? node.dataset.component : undefined
}

// Hidden elements (display:none, or genuinely zero-sized) can't be boxed —
// their rect is degenerate, and letting one win a signature's detection slot
// silently steals it from a visible sibling.
function isVisible(node: Element): boolean {
  const r = node.getBoundingClientRect()
  return r.width > 0 && r.height > 0
}

export function isInteresting(node: Element): boolean {
  if (!isVisible(node)) return false
  if (INTERESTING_TAGS.includes(node.tagName)) return true
  if (node.getAttribute('role')) return true
  if (dataComponentOf(node)) return true
  const cls = classesOf(node).toLowerCase()
  return KEYWORDS.some((k) => cls.includes(k))
}

export function categoryOf(node: Element): DetectionCategory {
  const tag = node.tagName
  const cls = classesOf(node).toLowerCase()
  if (tag === 'BUTTON' || CATEGORY_KEYWORDS.button.some((k) => cls.includes(k))) return 'button'
  if (tag === 'A' || CATEGORY_KEYWORDS.nav.some((k) => cls.includes(k))) return 'nav'
  if (['SELECT', 'TEXTAREA', 'INPUT'].includes(tag) || CATEGORY_KEYWORDS.field.some((k) => cls.includes(k)))
    return 'field'
  if (tag === 'TABLE' || CATEGORY_KEYWORDS.table.some((k) => cls.includes(k))) return 'table'
  if (CATEGORY_KEYWORDS.badge.some((k) => cls.includes(k))) return 'badge'
  return 'other'
}

export function passesFilter(node: Element, filters: DetectionFilters): boolean {
  return filters[categoryOf(node)] !== false
}

// Walks up from the clicked/hovered element to the nearest interesting
// ancestor that also passes the active filters. Returns null only when
// something interesting was found but filtered out; if nothing interesting
// was seen at all, falls back to boxing exactly what was clicked.
export function findInteresting(el: Element, doc: Document, filters: DetectionFilters): Element | null {
  let node: Element | null = el
  let depth = 0
  let sawInteresting = false
  while (node && node !== doc.body && depth < 8) {
    if (isInteresting(node)) {
      sawInteresting = true
      if (passesFilter(node, filters)) return node
    }
    node = node.parentElement
    depth++
  }
  return sawInteresting ? null : el
}

export function signatureOf(node: Element): string {
  const tag = node.tagName.toLowerCase()
  const dataComponent = dataComponentOf(node)
  if (dataComponent) return `data:${dataComponent}`
  const cls = classesOf(node).trim().split(/\s+/).filter(Boolean).sort().join('.')
  return cls ? `${tag}.${cls}` : tag
}

export function autoLabel(node: Element): string {
  const dataComponent = dataComponentOf(node)
  if (dataComponent) return titleCase(dataComponent)
  const cls = classesOf(node).toLowerCase()
  for (const k of KEYWORDS) {
    if (cls.includes(k)) return titleCase(k)
  }
  return titleCase(node.tagName.toLowerCase())
}

export function elementsForSignature(doc: Document, signature: string): Element[] {
  const out: Element[] = []
  doc.querySelectorAll('*').forEach((el) => {
    if (isInteresting(el) && signatureOf(el) === signature) out.push(el)
  })
  return out
}

// One element per distinct signature — the shared dedupe used by every bulk
// scan (manual auto-detect and the interactive workspace's settle capture).
export function collectDetectableElements(doc: Document, filters: DetectionFilters): Element[] {
  const seen = new Map<string, Element>()
  doc.querySelectorAll('*').forEach((el) => {
    if (!isInteresting(el) || !passesFilter(el, filters)) return
    const signature = signatureOf(el)
    if (!seen.has(signature)) seen.set(signature, el)
  })
  return Array.from(seen.values())
}

// Walks up from a click target to find what should label a flow transition:
// a data-action ancestor first, then the nearest button-like element's text.
export function traceLabelFor(el: Element): string {
  let node: Element | null = el
  for (let depth = 0; node && depth < 5; depth++, node = node.parentElement) {
    const action = node instanceof HTMLElement ? node.dataset.action : undefined
    if (action) return titleCase(action)
  }
  node = el
  for (let depth = 0; node && depth < 5; depth++, node = node.parentElement) {
    const isButtonLike = ['BUTTON', 'A'].includes(node.tagName) || node.getAttribute('role') === 'button'
    if (isButtonLike) {
      const text = (node.textContent ?? '').trim().replace(/\s+/g, ' ')
      if (text) return text.slice(0, 40)
    }
  }
  return 'Click'
}

export function rectPctOfLive(node: Element, frame: DOMRect): Block['rectPct'] {
  const r = node.getBoundingClientRect()
  return {
    left: (r.left / frame.width) * 100,
    top: (r.top / frame.height) * 100,
    width: (r.width / frame.width) * 100,
    height: (r.height / frame.height) * 100,
  }
}
