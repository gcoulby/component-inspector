// Identifies "this is a materially different screen" for the interactive
// workspace's settle detection — not a stable identity across sessions.
export function fingerprintOf(doc: Document): string {
  try {
    return doc.body.innerText.replace(/\s+/g, ' ').trim()
  } catch {
    return ''
  }
}
