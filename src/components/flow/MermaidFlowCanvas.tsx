import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import svgPanZoom from 'svg-pan-zoom'
import type { FlowEdge, View } from '@/types/project'
import { buildMermaidDefinition } from '@/lib/flow/mermaid'

let mermaidInitialized = false
function ensureMermaidInitialized() {
  if (mermaidInitialized) return
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    flowchart: { htmlLabels: true, curve: 'basis' },
  })
  mermaidInitialized = true
}

interface MermaidFlowCanvasProps {
  edges: FlowEdge[]
  views: View[]
  showImages: boolean
  resolveImageUrl: (view: View) => string | null
}

export function MermaidFlowCanvas({ edges, views, showImages, resolveImageUrl }: MermaidFlowCanvasProps) {
  const holderRef = useRef<HTMLDivElement>(null)
  const panZoomRef = useRef<ReturnType<typeof svgPanZoom> | null>(null)
  const [renderError, setRenderError] = useState<string | null>(null)

  useEffect(() => {
    ensureMermaidInitialized()
    const holder = holderRef.current
    if (!holder) return

    panZoomRef.current?.destroy()
    panZoomRef.current = null

    if (edges.length === 0) {
      holder.innerHTML = ''
      setRenderError(null)
      return
    }

    const def = buildMermaidDefinition(edges, views, showImages, resolveImageUrl)
    let cancelled = false

    mermaid
      .render(`mmd_${crypto.randomUUID().replace(/-/g, '')}`, def)
      .then(({ svg }) => {
        if (cancelled || !holder) return
        holder.innerHTML = svg
        setRenderError(null)
        const svgEl = holder.querySelector('svg')
        if (svgEl) {
          svgEl.removeAttribute('height')
          svgEl.removeAttribute('width')
          panZoomRef.current = svgPanZoom(svgEl, {
            zoomEnabled: true,
            panEnabled: true,
            controlIconsEnabled: true,
            fit: true,
            center: true,
            minZoom: 0.15,
            maxZoom: 15,
          })
        }
      })
      .catch(() => {
        if (cancelled) return
        setRenderError(def)
      })

    return () => {
      cancelled = true
      panZoomRef.current?.destroy()
      panZoomRef.current = null
    }
  }, [edges, views, showImages, resolveImageUrl])

  if (edges.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
        No transitions yet. Record a click-through in the Live session, or write flow lines by hand.
      </div>
    )
  }

  return (
    <div className="relative flex-1 overflow-hidden rounded-lg border border-border bg-secondary/30 m-4">
      {renderError ? (
        <pre className="h-full overflow-auto whitespace-pre-wrap p-4 font-mono text-xs text-muted-foreground">
          {renderError}
        </pre>
      ) : (
        <div ref={holderRef} className="h-full w-full [&_svg]:block [&_svg]:h-full [&_svg]:w-full" />
      )}
    </div>
  )
}
