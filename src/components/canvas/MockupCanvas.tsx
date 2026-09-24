import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { BlockOverlay } from '@/components/canvas/BlockOverlay'
import type { ProjectComponent, RectPct, View } from '@/types/project'
import { useLiveSessionStore } from '@/store/liveSessionStore'

const FRAME_WIDTH = 1280
const MIN_DRAW_SIZE_PCT = 1

interface MockupCanvasProps {
  view: View
  screenshotUrl: string | null
  components: ProjectComponent[]
  selectedComponentId: string | null
  onSelectComponent: (componentId: string) => void
  onRectChange: (blockId: string, rectPct: RectPct) => void
  onDrawBlock: (rectPct: RectPct) => void
}

// A saved view is a frozen screenshot, not a live re-render — matching the
// PoC, where the only place a mockup ever runs live is the Interactive tab.
// Boxes here can be selected, dragged, and resized in place; "Draw box" lets
// you add one by hand for anything auto-detect missed.
export function MockupCanvas({
  view,
  screenshotUrl,
  components,
  selectedComponentId,
  onSelectComponent,
  onRectChange,
  onDrawBlock,
}: MockupCanvasProps) {
  const showBoxes = useLiveSessionStore((s) => s.showBoxes)
  const drawBoxMode = useLiveSessionStore((s) => s.drawBoxMode)
  const setDrawBoxMode = useLiveSessionStore((s) => s.setDrawBoxMode)

  const frameRef = useRef<HTMLDivElement>(null)
  const [drawRect, setDrawRect] = useState<RectPct | null>(null)
  const drawStartRef = useRef<{ x: number; y: number } | null>(null)

  function pctFromEvent(e: ReactPointerEvent): { x: number; y: number } | null {
    const frame = frameRef.current?.getBoundingClientRect()
    if (!frame || frame.width === 0 || frame.height === 0) return null
    return {
      x: Math.min(Math.max(((e.clientX - frame.left) / frame.width) * 100, 0), 100),
      y: Math.min(Math.max(((e.clientY - frame.top) / frame.height) * 100, 0), 100),
    }
  }

  function handleBackgroundPointerDown(e: ReactPointerEvent) {
    if (!drawBoxMode) return
    const point = pctFromEvent(e)
    if (!point) return
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    drawStartRef.current = point
    setDrawRect({ left: point.x, top: point.y, width: 0, height: 0 })
  }

  function handleBackgroundPointerMove(e: ReactPointerEvent) {
    const start = drawStartRef.current
    if (!start) return
    const point = pctFromEvent(e)
    if (!point) return
    setDrawRect({
      left: Math.min(start.x, point.x),
      top: Math.min(start.y, point.y),
      width: Math.abs(point.x - start.x),
      height: Math.abs(point.y - start.y),
    })
  }

  function handleBackgroundPointerUp() {
    drawStartRef.current = null
    if (drawRect && drawRect.width >= MIN_DRAW_SIZE_PCT && drawRect.height >= MIN_DRAW_SIZE_PCT) {
      onDrawBlock(drawRect)
    }
    setDrawRect(null)
  }

  return (
    <main className="flex flex-1 flex-col overflow-auto bg-[image:linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] bg-[size:24px_24px] bg-background">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-background/95 px-3 py-1.5">
        <Button
          variant={drawBoxMode ? 'accentActive' : 'accentOutline'}
          size="sm"
          onClick={() => setDrawBoxMode(!drawBoxMode)}
        >
          {drawBoxMode ? '✛ Drawing — click and drag on the image' : '✛ Draw box'}
        </Button>
      </div>
      <div className="flex justify-center p-8">
        <div
          ref={frameRef}
          className="relative shrink-0 overflow-hidden rounded bg-black shadow-[0_0_0_1px_hsl(var(--border)),0_24px_60px_rgba(0,0,0,0.5)]"
          style={{ width: FRAME_WIDTH }}
        >
          {screenshotUrl ? (
            <img src={screenshotUrl} alt={view.name} className="block w-full" draggable={false} />
          ) : (
            <div className="p-16 text-center text-sm text-muted-foreground">
              No screenshot captured yet for this view.
            </div>
          )}
          <div
            className={cn('absolute inset-0', drawBoxMode ? 'cursor-crosshair' : 'pointer-events-none')}
            onPointerDown={handleBackgroundPointerDown}
            onPointerMove={handleBackgroundPointerMove}
            onPointerUp={handleBackgroundPointerUp}
          >
            {showBoxes &&
              view.blocks.map((block) => {
                const component = components.find((c) => c.id === block.componentId)
                if (!component) return null
                return (
                  <BlockOverlay
                    key={block.id}
                    block={block}
                    label={component.label}
                    color={component.color}
                    category={component.category}
                    selected={block.componentId === selectedComponentId}
                    frameRef={frameRef}
                    onSelect={() => onSelectComponent(block.componentId)}
                    onRectChange={(rectPct) => onRectChange(block.id, rectPct)}
                  />
                )
              })}
            {drawRect && (
              <div
                className="pointer-events-none absolute rounded-sm border-2 border-dashed border-white bg-white/10"
                style={{
                  left: `${drawRect.left}%`,
                  top: `${drawRect.top}%`,
                  width: `${drawRect.width}%`,
                  height: `${drawRect.height}%`,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
