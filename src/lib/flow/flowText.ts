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
