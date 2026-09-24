import { useEffect, useState } from 'react'
import { FlowTextEditor } from '@/components/flow/FlowTextEditor'
import { MermaidFlowCanvas } from '@/components/flow/MermaidFlowCanvas'
import { ExportPanel } from '@/components/flow/ExportPanel'
import { useProject } from '@/hooks/useProject'
import { parseFlowText } from '@/lib/flow/flowText'
import { buildMarkdownReport } from '@/lib/flow/markdown'
import { blobToDataUrl } from '@/lib/blobToDataUrl'
import type { View } from '@/types/project'

// The live diagram and the exported markdown reference images differently on
// purpose. Exported files reference a relative assets/<uuid>.png path —
// that's the actual point of the .fdr format, keeping the project.json and
// the .md small regardless of how many screenshots there are. The live
// in-app preview has no server to resolve that path against, so it embeds a
// data URI instead — ephemeral, never written back to the project, and safe
// now that Mermaid is configured with the same maxTextSize/maxEdges the PoC
// used (the default ~50k-char cap, not embedding itself, was what crashed).
export function FlowPage() {
  const { project, assets, updateProject } = useProject()
  const [showImages, setShowImages] = useState(true)
  const [screenshotUrls, setScreenshotUrls] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    let cancelled = false
    const entries = (project?.views ?? []).filter((v) => v.screenshotAssetId)

    Promise.all(
      entries.map(async (v) => {
        const blob = assets.get(`assets/${v.screenshotAssetId}.png`)
        if (!blob) return null
        return [v.id, await blobToDataUrl(blob)] as const
      }),
    ).then((resolved) => {
      if (cancelled) return
      setScreenshotUrls(new Map(resolved.filter((e): e is [string, string] => e !== null)))
    })

    return () => {
      cancelled = true
    }
  }, [project?.views, assets])

  if (!project) {
    return (
      <div className="flex flex-1 items-center justify-center overflow-hidden bg-background">
        <p className="text-sm text-muted-foreground">Start or open a project to see its flow.</p>
      </div>
    )
  }

  const edges = parseFlowText(project.flowText)
  const markdown = buildMarkdownReport(project, true)
  const resolveImageUrl = (view: View) => screenshotUrls.get(view.id) ?? null

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* One left column for both the flow text editor and export, matching
          the PoC's layout — the canvas is the only other column, so it gets
          every remaining pixel instead of being squeezed by a third panel. */}
      <aside className="flex w-80 shrink-0 flex-col overflow-y-auto border-r border-border">
        <FlowTextEditor
          flowText={project.flowText}
          onChange={(flowText) => updateProject((p) => ({ ...p, flowText }))}
          showImages={showImages}
          onToggleImages={() => setShowImages((v) => !v)}
        />
        <ExportPanel project={project} assets={assets} markdown={markdown} />
      </aside>
      <MermaidFlowCanvas
        edges={edges}
        views={project.views}
        showImages={showImages}
        resolveImageUrl={resolveImageUrl}
      />
    </div>
  )
}
