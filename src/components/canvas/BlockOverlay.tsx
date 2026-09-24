import { useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import { cn } from '@/lib/utils'
import { contrastTextColor } from '@/data/componentColors'
import { CATEGORY_ICONS } from '@/data/categoryPresentation'
import type { Block, ComponentCategory, RectPct } from '@/types/project'

const MIN_SIZE_PCT = 1.5

const HANDLES = [
  { key: 'nw', cursor: 'cursor-nwse-resize', className: '-left-1 -top-1' },
  { key: 'n', cursor: 'cursor-ns-resize', className: 'left-1/2 -top-1 -translate-x-1/2' },
  { key: 'ne', cursor: 'cursor-nesw-resize', className: '-right-1 -top-1' },
  { key: 'e', cursor: 'cursor-ew-resize', className: '-right-1 top-1/2 -translate-y-1/2' },
  { key: 'se', cursor: 'cursor-nwse-resize', className: '-right-1 -bottom-1' },
  { key: 's', cursor: 'cursor-ns-resize', className: 'left-1/2 -bottom-1 -translate-x-1/2' },
  { key: 'sw', cursor: 'cursor-nesw-resize', className: '-left-1 -bottom-1' },
  { key: 'w', cursor: 'cursor-ew-resize', className: '-left-1 top-1/2 -translate-y-1/2' },
] as const

function clampRect(rect: RectPct): RectPct {
  let { left, top, width, height } = rect
  width = Math.max(width, MIN_SIZE_PCT)
  height = Math.max(height, MIN_SIZE_PCT)
  left = Math.min(Math.max(left, 0), 100 - width)
  top = Math.min(Math.max(top, 0), 100 - height)
  return { left, top, width, height }
}

function applyResize(start: RectPct, handle: string, dxPct: number, dyPct: number): RectPct {
  let { left, top, width, height } = start
  if (handle.includes('w')) {
    left += dxPct
    width -= dxPct
  }
  if (handle.includes('e')) width += dxPct
  if (handle.includes('n')) {
    top += dyPct
    height -= dyPct
  }
  if (handle.includes('s')) height += dyPct
  return clampRect({ left, top, width, height })
}

function applyMove(start: RectPct, dxPct: number, dyPct: number): RectPct {
  return clampRect({ ...start, left: start.left + dxPct, top: start.top + dyPct })
}

interface DragState {
  kind: 'move' | 'resize'
  handle?: string
  startClientX: number
  startClientY: number
  startRect: RectPct
  moved: boolean
}

interface BlockOverlayProps {
  block: Block
  label: string
  color: string
  category: ComponentCategory
  selected: boolean
  frameRef: RefObject<HTMLElement | null>
  onSelect: () => void
  onRectChange: (rectPct: RectPct) => void
}

// Boxes are edited directly on the canvas: drag the body to move it, drag a
// handle (shown once selected) to resize it. A pointerdown/up with no real
// movement in between is treated as a plain click (select only) so ordinary
// selecting never nudges a box by a fraction of a percent.
export function BlockOverlay({ block, label, color, category, selected, frameRef, onSelect, onRectChange }: BlockOverlayProps) {
  const [draft, setDraft] = useState<RectPct | null>(null)
  const dragRef = useRef<DragState | null>(null)

  const rect = draft ?? block.rectPct
  const textColor = contrastTextColor(color)

  function beginDrag(e: ReactPointerEvent, kind: 'move' | 'resize', handle?: string) {
    e.stopPropagation()
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    dragRef.current = {
      kind,
      handle,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startRect: block.rectPct,
      moved: false,
    }
  }

  function onPointerMove(e: ReactPointerEvent) {
    const drag = dragRef.current
    if (!drag) return
    const frame = frameRef.current?.getBoundingClientRect()
    if (!frame || frame.width === 0 || frame.height === 0) return
    const dxPct = ((e.clientX - drag.startClientX) / frame.width) * 100
    const dyPct = ((e.clientY - drag.startClientY) / frame.height) * 100
    if (Math.abs(dxPct) > 0.2 || Math.abs(dyPct) > 0.2) drag.moved = true
    const next =
      drag.kind === 'move' ? applyMove(drag.startRect, dxPct, dyPct) : applyResize(drag.startRect, drag.handle!, dxPct, dyPct)
    setDraft(next)
  }

  function onPointerUp() {
    const drag = dragRef.current
    dragRef.current = null
    if (!drag) return
    if (drag.moved && draft) {
      onRectChange(draft)
    } else {
      onSelect()
    }
    setDraft(null)
  }

  return (
    <div
      onPointerDown={(e) => beginDrag(e, 'move')}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={cn('pointer-events-auto absolute cursor-move touch-none rounded-sm border-2', selected && 'ring-2 ring-white')}
      style={{
        left: `${rect.left}%`,
        top: `${rect.top}%`,
        width: `${rect.width}%`,
        height: `${rect.height}%`,
        borderColor: color,
        backgroundColor: `${color}26`,
      }}
    >
      <span
        className="pointer-events-none absolute -top-[19px] left-[-2px] whitespace-nowrap rounded-t px-1.5 py-0.5 font-mono text-[10px] font-semibold"
        style={{ backgroundColor: color, color: textColor }}
      >
        {CATEGORY_ICONS[category]} {label}
      </span>
      {selected &&
        HANDLES.map((h) => (
          <div
            key={h.key}
            onPointerDown={(e) => beginDrag(e, 'resize', h.key)}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            className={cn('pointer-events-auto absolute h-2.5 w-2.5 touch-none rounded-full border border-white bg-black', h.cursor, h.className)}
          />
        ))}
    </div>
  )
}
