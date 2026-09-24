import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { buildExportArchive } from '@/lib/flow/exportArchive'
import type { Project } from '@/types/project'

interface ExportPanelProps {
  project: Project
  assets: Map<string, Blob>
  markdown: string
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function ExportPanel({ project, assets, markdown }: ExportPanelProps) {
  const [status, setStatus] = useState<string | null>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setStatus('Report copied to clipboard')
    } catch {
      setStatus('Could not copy — try Download instead')
    }
  }

  const handleDownload = async () => {
    setStatus('Zipping…')
    const blob = await buildExportArchive(project, assets)
    downloadBlob(blob, `${project.name || 'component-inspector-fdr'}.zip`)
    setStatus('Download started')
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      <h3 className="text-sm font-medium">Export</h3>
      <Button size="sm" onClick={() => void handleCopy()}>
        Copy report (Markdown)
      </Button>
      <Button variant="outline" size="sm" onClick={() => void handleDownload()}>
        Download .zip
      </Button>
      <p className="text-[11px] leading-relaxed text-muted-faint">
        The zip has two markdown files — a full version with thumbnails on the flow graph, and a plain one without —
        plus the assets/ folder both of them reference. Copy only grabs the full version&apos;s text.
      </p>
      {status && <span className="text-xs text-muted-foreground">{status}</span>}
    </div>
  )
}
