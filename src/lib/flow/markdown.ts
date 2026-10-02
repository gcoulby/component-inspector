import type { Project } from '@/types/project'
import { CATEGORY_BADGES } from '@/data/categoryPresentation'
import { parseFlowText } from '@/lib/flow/flowText'
import { buildMermaidDefinition } from '@/lib/flow/mermaid'
import type { ExportAssetPlan } from '@/lib/flow/exportAssets'

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'x'
}

// Per-view screenshots always render — showGraphImages only controls whether
// the Mermaid diagram's own nodes carry a thumbnail. The "no-thumbnail"
// export exists because not every Markdown renderer (or Mermaid version) on
// the receiving end supports HTML labels, and a plain-text graph degrades
// safely everywhere.
export function buildMarkdownReport(project: Project, showGraphImages: boolean, plan: ExportAssetPlan): string {
  const edges = parseFlowText(project.flowText)
  let md = '# Componentised breakdown\n\n'

  if (edges.length > 0) {
    const def = buildMermaidDefinition(edges, project.views, showGraphImages, (view) =>
      view.screenshotAssetId ? `assets/${view.screenshotAssetId}.png` : null,
    )
    md += '```mermaid\n' + def + '```\n\n'
    if (showGraphImages) {
      md +=
        '_Note: node images require a Mermaid renderer with HTML labels enabled. The plain flow is still there in the diagram text either way._\n\n'
    }
  }

  project.views.forEach((view, i) => {
    md += `## View ${i}: ${view.name}\n\n`
    const boxedPath = plan.boxed.get(view.id) ?? plan.raw.get(view.id)
    if (boxedPath) md += `![${view.name}](${boxedPath})\n\n`
    const rawPath = plan.raw.get(view.id)
    if (rawPath && plan.boxed.has(view.id)) {
      md += `<details><summary>Raw screenshot (no boxes)</summary>\n\n![${view.name} — raw](${rawPath})\n\n</details>\n\n`
    }
    if (view.details) md += `${view.details}\n\n`

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

    const shownRefs = new Set<string>()
    for (const block of view.blocks) {
      const comp = project.components.find((c) => c.id === block.componentId)
      const refPath = comp && plan.refs.get(comp.id)
      if (!comp || !refPath || shownRefs.has(comp.id)) continue
      shownRefs.add(comp.id)
      const entry = project.manifest.find((m) => m.name === comp.matchedName)
      if (shownRefs.size === 1) md += '**Library components on this view**\n\n'
      md += `_${entry?.name ?? comp.label}_ (${comp.label})\n\n![${entry?.name ?? comp.label}](${refPath})\n\n`
    }

    const cropped = view.blocks.filter((b) => plan.crops.has(b.id))
    if (cropped.length > 0) {
      md += '**Boxes on this view**\n\n'
      for (const block of cropped) {
        const comp = project.components.find((c) => c.id === block.componentId)
        md += `_${comp?.label ?? block.tag}_\n\n![${comp?.label ?? block.tag}](${plan.crops.get(block.id)})\n\n`
      }
    }
  })

  if (project.components.length > 0) {
    md += '## Component analysis\n\n'
    for (const c of project.components) {
      md += `### <a id="comp-${slugify(c.label)}"></a>${c.label} — ${CATEGORY_BADGES[c.category]}\n\n`
      if (c.matchedName) md += `- Library component: \`${c.matchedName}\`\n`
      const entry = project.manifest.find((m) => m.name === c.matchedName)
      if (entry?.description) md += `- Library description: ${entry.description.replace(/\n/g, ' ')}\n`
      if (entry?.url) md += `- Library link: ${entry.url}\n`
      if (c.refUrl) md += `- Reference: ${c.refUrl}\n`
      if (c.notes) md += `- Notes: ${c.notes.replace(/\n/g, ' ')}\n`
      md += '\n'
    }
  }

  return md
}
