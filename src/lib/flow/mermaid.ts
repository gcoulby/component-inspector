import type { FlowEdge, View } from '@/types/project'

export function mermaidNodeId(name: string): string {
  return 'n_' + name.replace(/[^a-zA-Z0-9]/g, '_')
}

// Used by both the live preview and the markdown export — they just pass
// different resolvers. The live canvas resolves to a data URI (ephemeral,
// fine to embed); the export resolves to a relative assets/<uuid>.png path
// (persisted, must stay small). Either way this needs mermaid.initialize's
// maxTextSize raised well past the ~50k-char default, or a handful of
// screenshots' worth of data URIs blows the limit outright.
export function buildMermaidDefinition(
  edges: FlowEdge[],
  views: View[],
  showImages: boolean,
  resolveImageUrl: (view: View) => string | null,
): string {
  const names = new Set<string>()
  edges.forEach((e) => {
    names.add(e.from)
    names.add(e.to)
  })

  let def = 'flowchart TD\n'
  names.forEach((name) => {
    const view = views.find((v) => v.name === name)
    const safeName = name.replace(/"/g, "'")
    const imageUrl = showImages && view ? resolveImageUrl(view) : null
    if (imageUrl) {
      def += `  ${mermaidNodeId(name)}["<img src='${imageUrl}' style='width:150px;display:block;border-radius:6px;margin:0 auto 6px;border:1px solid #333;' /><div style='font-size:12px;font-weight:600;'>${safeName}</div>"]\n`
    } else {
      def += `  ${mermaidNodeId(name)}["${safeName}"]\n`
    }
  })

  edges.forEach((e) => {
    const label = e.label ? `|"${e.label.replace(/"/g, "'")}"|` : ''
    def += `  ${mermaidNodeId(e.from)} -->${label} ${mermaidNodeId(e.to)}\n`
  })

  return def
}
