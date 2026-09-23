import { useEffect, useState } from 'react'
import { FlowTextEditor } from '@/components/flow/FlowTextEditor'
import { MermaidFlowCanvas } from '@/components/flow/MermaidFlowCanvas'
import { ExportPanel } from '@/components/flow/ExportPanel'
import { useProject } from '@/hooks/useProject'
import { parseFlowText } from '@/lib/flow/flowText'
import { buildMarkdownReport } from '@/lib/flow/markdown'
import { blobToDataUrl } from '@/lib/blobToDataUrl'
import type { View } from '@/types/project'

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
  const markdown = buildMarkdownReport(project)
  const resolveImageUrl = (view: View) => screenshotUrls.get(view.id) ?? null

  return (
    <div className="flex flex-1 overflow-hidden">
      <FlowTextEditor
        flowText={project.flowText}
        onChange={(flowText) => updateProject((p) => ({ ...p, flowText }))}
        showImages={showImages}
        onToggleImages={() => setShowImages((v) => !v)}
      />
      <MermaidFlowCanvas
        edges={edges}
        views={project.views}
        showImages={showImages}
        resolveImageUrl={resolveImageUrl}
      />
      <ExportPanel markdown={markdown} />
    </div>
  )
}
