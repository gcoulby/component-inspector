import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { View } from '@/types/project'
import type { DetectionFilters } from '@/data/detectionHeuristics'
import { autoLabel, findInteresting, isInteresting, passesFilter, signatureOf } from '@/lib/detection/dom'

const FRAME_WIDTH = 1280
const MIN_FRAME_HEIGHT = 500
const MAX_FRAME_HEIGHT = 6000

interface HoverState {
  rect: DOMRect
  label: string
}

interface MockupCanvasProps {
  view: View | null
  mockupHtml: string | null
  filters: DetectionFilters
  onAddBlock: (node: Element, frame: DOMRect) => void
  onAutoDetect: (elements: Element[], frame: DOMRect) => number
  onLoadMockupClick: () => void
}

export function MockupCanvas({
  view,
  mockupHtml,
  filters,
  onAddBlock,
  onAutoDetect,
  onLoadMockupClick,
}: MockupCanvasProps) {
  const [inspectMode, setInspectMode] = useState(false)
  const [hover, setHover] = useState<HoverState | null>(null)
  const [frameHeight, setFrameHeight] = useState(MIN_FRAME_HEIGHT)
  const [detectMessage, setDetectMessage] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const inspectModeRef = useRef(inspectMode)
  const filtersRef = useRef(filters)
  const onAddBlockRef = useRef(onAddBlock)
  useEffect(() => {
    inspectModeRef.current = inspectMode
  }, [inspectMode])
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])
  useEffect(() => {
    onAddBlockRef.current = onAddBlock
  }, [onAddBlock])

  useEffect(() => {
    if (!detectMessage) return
    const timer = setTimeout(() => setDetectMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [detectMessage])

  const resizeFrame = useCallback((iframe: HTMLIFrameElement, idoc: Document) => {
    // Reset to a fixed baseline before measuring, never to 0px — a shell built
    // on min-height:100vh needs a real viewport to measure against, and never
    // inherit the previous view's height or a vh-based layout won't shrink.
    iframe.style.height = '1000px'
    void iframe.offsetHeight
    const h = Math.min(Math.max(idoc.documentElement.scrollHeight, MIN_FRAME_HEIGHT), MAX_FRAME_HEIGHT)
    iframe.style.height = `${h}px`
    setFrameHeight(h)
  }, [])

  const handleFrameLoad = useCallback(() => {
    const iframe = iframeRef.current
    const idoc = iframe?.contentDocument
    if (!iframe || !idoc) return

    resizeFrame(iframe, idoc)

    idoc.addEventListener('mousemove', (e) => {
      if (!inspectModeRef.current) return
      const target = findInteresting(e.target as Element, idoc, filtersRef.current)
      setHover(target ? { rect: target.getBoundingClientRect(), label: autoLabel(target) } : null)
    })
    idoc.addEventListener('mouseleave', () => setHover(null))
    idoc.addEventListener(
      'click',
      (e) => {
        if (!inspectModeRef.current) return
        e.preventDefault()
        e.stopPropagation()
        const target = findInteresting(e.target as Element, idoc, filtersRef.current)
        if (!target) return
        onAddBlockRef.current(target, iframe.getBoundingClientRect())
      },
      true,
    )
  }, [resizeFrame])

  const handleAutoDetect = useCallback(() => {
    const iframe = iframeRef.current
    const idoc = iframe?.contentDocument
    if (!iframe || !idoc) return

    resizeFrame(iframe, idoc)
    const frame = iframe.getBoundingClientRect()

    const seen = new Map<string, Element>()
    idoc.querySelectorAll('*').forEach((el) => {
      if (!isInteresting(el) || !passesFilter(el, filters)) return
      const signature = signatureOf(el)
      if (!seen.has(signature)) seen.set(signature, el)
    })

    const added = onAutoDetect(Array.from(seen.values()), frame)
    setDetectMessage(added > 0 ? `Added ${added} detected block${added === 1 ? '' : 's'}` : 'Nothing new found — try Inspect mode for anything unusual')
  }, [filters, onAutoDetect, resizeFrame])

  if (!view || mockupHtml === null) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 overflow-auto bg-background">
        <p className="text-sm text-muted-foreground">Load a mockup to get started</p>
        <Button size="sm" onClick={onLoadMockupClick}>
          + Load mockup
        </Button>
      </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col overflow-auto bg-background">
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <Button
          variant={inspectMode ? 'default' : 'outline'}
          size="sm"
          onClick={() => setInspectMode((v) => !v)}
        >
          Inspect: {inspectMode ? 'on' : 'off'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleAutoDetect}>
          Auto-detect
        </Button>
        {inspectMode && !detectMessage && (
          <span className="text-xs text-muted-foreground">Hover to highlight, click to box</span>
        )}
        {detectMessage && <span className="text-xs text-muted-foreground">{detectMessage}</span>}
      </div>
      <div className="flex justify-center p-6">
        <div className="relative shrink-0" style={{ width: FRAME_WIDTH, height: frameHeight }}>
          <iframe
            ref={iframeRef}
            title={view.name}
            srcDoc={mockupHtml}
            sandbox="allow-same-origin allow-scripts"
            onLoad={handleFrameLoad}
            className="block w-full border-0 bg-white"
          />
          <div className="pointer-events-none absolute inset-0">
            {view.blocks.map((block) => (
              <div
                key={block.id}
                className="absolute rounded-sm border border-primary/70 bg-primary/10"
                style={{
                  left: `${block.rectPct.left}%`,
                  top: `${block.rectPct.top}%`,
                  width: `${block.rectPct.width}%`,
                  height: `${block.rectPct.height}%`,
                }}
              />
            ))}
            {hover && (
              <div
                className="absolute rounded-sm border-2 border-dashed border-white bg-white/10"
                style={{
                  left: hover.rect.left,
                  top: hover.rect.top,
                  width: hover.rect.width,
                  height: hover.rect.height,
                }}
              >
                <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-black">
                  {hover.label}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
