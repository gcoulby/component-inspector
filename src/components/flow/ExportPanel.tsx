import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ExportPanelProps {
  markdown: string
}

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function ExportPanel({ markdown }: ExportPanelProps) {
  const [status, setStatus] = useState<string | null>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setStatus('Report copied to clipboard')
    } catch {
      setStatus('Could not copy — try Download instead')
    }
  }

  const handleDownload = () => {
    downloadText(markdown, 'component-inspector-fdr.md')
    setStatus('Download started')
  }

  return (
    <div className="flex w-64 shrink-0 flex-col gap-2 border-l border-border p-3">
      <h3 className="text-sm font-medium">Export</h3>
      <Button size="sm" onClick={() => void handleCopy()}>
        Copy report (Markdown)
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownload}>
        Download .md
      </Button>
      {status && <span className="text-xs text-muted-foreground">{status}</span>}
    </div>
  )
}
