import { CATEGORY_ICONS } from '@/data/categoryPresentation'
import { contrastTextColor } from '@/data/componentColors'
import type { Block, ProjectComponent, RectPct } from '@/types/project'

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not encode image'))), 'image/png')
  })
}

function pxRect(rect: RectPct, width: number, height: number) {
  return {
    x: (rect.left / 100) * width,
    y: (rect.top / 100) * height,
    w: (rect.width / 100) * width,
    h: (rect.height / 100) * height,
  }
}

export interface BoxedBlock {
  block: Block
  component: ProjectComponent
}

// The raw capture with every block drawn over it in its component's color —
// the same look as the canvas overlay, baked into an image.
export async function renderBoxedScreenshot(raw: Blob, boxes: BoxedBlock[]): Promise<Blob> {
  const bitmap = await createImageBitmap(raw)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available')
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()

  ctx.font = '600 12px ui-monospace, Menlo, monospace'
  ctx.textBaseline = 'middle'
  for (const { block, component } of boxes) {
    const { x, y, w, h } = pxRect(block.rectPct, canvas.width, canvas.height)
    ctx.fillStyle = `${component.color}26`
    ctx.fillRect(x, y, w, h)
    ctx.strokeStyle = component.color
    ctx.lineWidth = 3
    ctx.strokeRect(x, y, w, h)

    const text = `${CATEGORY_ICONS[component.category]} ${component.label}`
    const chipW = Math.min(ctx.measureText(text).width + 12, Math.max(w, 60) + 40)
    const chipH = 18
    const chipY = y - chipH >= 0 ? y - chipH : y
    ctx.fillStyle = component.color
    ctx.fillRect(x, chipY, chipW, chipH)
    ctx.fillStyle = contrastTextColor(component.color)
    ctx.fillText(text, x + 6, chipY + chipH / 2, chipW - 8)
  }
  return canvasToPng(canvas)
}

export async function cropScreenshot(raw: Blob, rect: RectPct): Promise<Blob | null> {
  const bitmap = await createImageBitmap(raw)
  const { x, y, w, h } = pxRect(rect, bitmap.width, bitmap.height)
  const width = Math.max(1, Math.round(w))
  const height = Math.max(1, Math.round(h))
  if (width < 2 || height < 2) {
    bitmap.close()
    return null
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return null
  }
  ctx.drawImage(bitmap, Math.round(x), Math.round(y), width, height, 0, 0, width, height)
  bitmap.close()
  return canvasToPng(canvas)
}

// Bakes a colored frame into the image itself rather than relying on CSS,
// so the border survives any markdown renderer.
export async function addColoredBorder(image: Blob, color: string, borderPx = 6): Promise<Blob> {
  const bitmap = await createImageBitmap(image)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width + borderPx * 2
  canvas.height = bitmap.height + borderPx * 2
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not available')
  ctx.fillStyle = color
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, borderPx, borderPx)
  bitmap.close()
  return canvasToPng(canvas)
}
