import { VIEW_TITLE_SELECTORS } from '@/data/detectionHeuristics'

function uniqueName(base: string, existingNames: string[]): string {
  let name = base
  let n = 2
  while (existingNames.includes(name)) {
    name = `${base} (${n})`
    n++
  }
  return name
}

export function deriveViewName(html: string, existingNames: string[], fallbackIndex: number): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  for (const selector of VIEW_TITLE_SELECTORS) {
    let el: Element | null = null
    try {
      el = doc.querySelector(selector)
    } catch {
      continue
    }
    const text = el?.textContent?.trim()
    if (text) return uniqueName(text.slice(0, 40), existingNames)
  }
  return uniqueName(`View ${fallbackIndex}`, existingNames)
}
