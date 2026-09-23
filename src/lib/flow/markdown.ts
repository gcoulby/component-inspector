import type { Project } from '@/types/project'
import { CATEGORY_BADGES } from '@/data/categoryPresentation'
import { parseFlowText } from '@/lib/flow/flowText'
import { buildMermaidDefinition } from '@/lib/flow/mermaid'

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'x'
}

export function buildMarkdownReport(project: Project): string {
  const edges = parseFlowText(project.flowText)
  let md = '# Componentised breakdown\n\n'

  if (edges.length > 0) {
    const def = buildMermaidDefinition(edges, project.views, true, (view) =>
      view.screenshotAssetId ? `assets/${view.screenshotAssetId}.png` : null,
    )
    md += '```mermaid\n' + def + '```\n\n'
    md +=
      '_Note: node images require a Mermaid renderer with HTML labels enabled. The plain flow is still there in the diagram text either way._\n\n'
  }

  project.views.forEach((view, i) => {
    md += `## View ${i}: ${view.name}\n\n`
    if (view.screenshotAssetId) md += `![${view.name}](assets/${view.screenshotAssetId}.png)\n\n`

    const counts = new Map<string, number>()
    for (const block of view.blocks) {
      counts.set(block.componentId, (counts.get(block.componentId) ?? 0) + 1)
    }
    if (counts.size === 0) {
      md += '_No components recorded for this view._\n\n'
      return
    }
    md += '**Shopping list**\n\n'
    counts.forEach((count, componentId) => {
      const comp = project.components.find((c) => c.id === componentId)
      if (!comp) return
      md += `- [${comp.label}${count > 1 ? ` ×${count}` : ''}](#comp-${slugify(comp.label)})\n`
    })
    md += '\n'
  })

  if (project.components.length > 0) {
    md += '## Component analysis\n\n'
    for (const c of project.components) {
      md += `### <a id="comp-${slugify(c.label)}"></a>${c.label} — ${CATEGORY_BADGES[c.category]}\n\n`
      if (c.matchedName) md += `- Library component: \`${c.matchedName}\`\n`
      if (c.refUrl) md += `- Reference: ${c.refUrl}\n`
      if (c.notes) md += `- Notes: ${c.notes.replace(/\n/g, ' ')}\n`
      md += '\n'
    }
  }

  return md
}
