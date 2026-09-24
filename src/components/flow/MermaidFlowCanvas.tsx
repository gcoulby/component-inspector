import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import svgPanZoom from 'svg-pan-zoom'
import { Button } from '@/components/ui/button'
import type { FlowEdge, View } from '@/types/project'
import { buildMermaidDefinition } from '@/lib/flow/mermaid'

let mermaidInitialized = false
function ensureMermaidInitialized() {
  if (mermaidInitialized) return
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
    // A handful of embedded screenshot data URIs blows straight past the
    // ~50k-char default — matches the PoC's own config, not an arbitrary bump.
    maxTextSize: 30_000_000,
    maxEdges: 2000,
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
  const containerRef = useRef<HTMLDivElement>(null)
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
          // Mermaid caps its own output at the diagram's natural pixel size
          // via an inline max-width — meant for docs embedding, but it also
          // caps svg-pan-zoom's fit() from ever scaling past that, no matter
          // how much wider the container actually is.
          svgEl.style.removeProperty('max-width')
          const pz = svgPanZoom(svgEl, {
            zoomEnabled: true,
            panEnabled: true,
            controlIconsEnabled: false,
            fit: true,
            center: true,
            minZoom: 0.15,
            maxZoom: 15,
          })
          panZoomRef.current = pz
          // The container isn't guaranteed to have its final flex-resolved
          // size on the same tick the SVG is inserted — fit/center again
          // after layout actually settles, or wide diagrams render clipped.
          requestAnimationFrame(() => {
            pz.resize()
            pz.fit()
            pz.center()
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

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(() => {
      panZoomRef.current?.resize()
      panZoomRef.current?.fit()
      panZoomRef.current?.center()
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  if (edges.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
        No transitions yet. Record a click-through in the Live session, or write flow lines by hand.
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative m-4 flex-1 overflow-hidden rounded-lg border border-border bg-secondary/30">
      {renderError ? (
        <pre className="h-full overflow-auto whitespace-pre-wrap p-4 font-mono text-xs text-muted-foreground">
          {renderError}
        </pre>
      ) : (
        <>
          <div ref={holderRef} className="h-full w-full [&_svg]:block [&_svg]:h-full [&_svg]:w-full" />
          <div className="absolute bottom-3 left-3 flex gap-1 rounded-md border border-border-strong bg-card/90 p-1 shadow-lg backdrop-blur">
            <Button variant="ghost" size="sm" onClick={() => panZoomRef.current?.zoomIn()} title="Zoom in">
              +
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                panZoomRef.current?.resize()
                panZoomRef.current?.fit()
                panZoomRef.current?.center()
              }}
              title="Fit to view"
            >
              Fit
            </Button>
            <Button variant="ghost" size="sm" onClick={() => panZoomRef.current?.zoomOut()} title="Zoom out">
              −
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
