import type { FlowEdge } from '@/types/project'

const LINE_PATTERN = /^(.+?)\s*->\s*([^:]+?)(?:\s*:\s*(.+))?$/

export function parseFlowText(flowText: string): FlowEdge[] {
  const edges: FlowEdge[] = []
  for (const line of flowText.split('\n').map((l) => l.trim()).filter(Boolean)) {
    const m = line.match(LINE_PATTERN)
    if (!m) continue
    edges.push({ from: m[1].trim(), to: m[2].trim(), label: (m[3] ?? '').trim() })
  }
  return edges
}

// Lines are added automatically while recording — dedupe so re-visiting the
// same transition doesn't pile up identical lines.
export function appendFlowLine(flowText: string, from: string, to: string, label: string): string {
  if (from === to) return flowText
  const line = `${from} -> ${to} : ${label}`
  const lines = flowText.split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.includes(line)) return flowText
  return [...lines, line].join('\n')
}

// Repoints every edge referencing oldName at newName — used when a view is
// renamed or merged into another. Drops self-loops the merge would create
// and dedupes lines that collide once repointed.
export function renameNodeInFlow(flowText: string, oldName: string, newName: string): string {
  if (oldName === newName) return flowText
  const lines = flowText.split('\n').map((l) => l.trim()).filter(Boolean)
  const seen = new Set<string>()
  const out: string[] = []
  for (const line of lines) {
    const m = line.match(LINE_PATTERN)
    if (!m) {
      if (!seen.has(line)) {
        seen.add(line)
        out.push(line)
      }
      continue
    }
    let from = m[1].trim()
    let to = m[2].trim()
    const label = (m[3] ?? '').trim()
    if (from === oldName) from = newName
    if (to === oldName) to = newName
    if (from === to) continue
    const rebuilt = label ? `${from} -> ${to} : ${label}` : `${from} -> ${to}`
    if (!seen.has(rebuilt)) {
      seen.add(rebuilt)
      out.push(rebuilt)
    }
  }
  return out.join('\n')
}
