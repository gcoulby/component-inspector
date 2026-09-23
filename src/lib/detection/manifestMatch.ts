import type { ManifestEntry } from '@/types/project'
import { classesOf } from '@/lib/detection/dom'

// Ties and near-misses are not resolved here — this returns a first guess,
// a human confirms or overrides it in the detail panel.
export function matchManifest(node: Element, manifest: ManifestEntry[]): ManifestEntry | null {
  const hay = `${node.tagName} ${classesOf(node)}`.toLowerCase()
  let best: ManifestEntry | null = null
  let bestScore = 0
  for (const entry of manifest) {
    let score = 0
    for (const kw of entry.keywords) {
      if (kw && hay.includes(kw.toLowerCase())) score++
    }
    if (score > bestScore) {
      bestScore = score
      best = entry
    }
  }
  return best
}
