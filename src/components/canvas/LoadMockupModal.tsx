import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface LoadMockupModalProps {
  open: boolean
  onClose: () => void
  onLoad: (html: string) => void
}

export function LoadMockupModal({ open, onClose, onLoad }: LoadMockupModalProps) {
  const [html, setHtml] = useState('')

  if (!open) return null

  const handleLoad = () => {
    if (!html.trim()) return
    onLoad(html)
    setHtml('')
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex w-[600px] max-w-[90vw] flex-col gap-3 rounded-lg border border-border bg-card p-5">
        <h2 className="text-sm font-semibold">Load a mockup</h2>
        <p className="text-xs text-muted-foreground">
          Paste the whole single-file mockup — a single screen or a full SPA flow both work. It loads live so you
          can click through it; start recording or hit &ldquo;Save view&rdquo; whenever you want to freeze the
          current screen.
        </p>
        <textarea
          className="h-56 w-full resize-y rounded-md border border-input bg-secondary p-2.5 font-mono text-xs text-foreground"
          placeholder="Paste the full HTML of the mockup here..."
          spellCheck={false}
          value={html}
          onChange={(e) => setHtml(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" size="sm" disabled={!html.trim()} onClick={handleLoad}>
            Load
          </Button>
        </div>
      </div>
    </div>
  )
}
