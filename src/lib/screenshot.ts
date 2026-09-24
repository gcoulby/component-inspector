import html2canvas from 'html2canvas'

// Two RAFs plus a short settle delay — layout needs to actually finish
// applying (fonts, reflow) before html2canvas walks the DOM, or captures
// come out mid-layout.
export function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

const CAPTURE_MAX_HEIGHT = 20000

interface SavedRegionStyle {
  el: HTMLElement
  overflow: string
  overflowY: string
  maxHeight: string
}

// Panels with their own overflow-y:auto/scroll (a code block, an item list)
// clip their content independent of the page's own height — the outer
// document never grows to fit them, so resizing the iframe alone still
// leaves their overflow cut off in the shot. Force them open for the
// capture, then put the original (scrollable, fixed-height) styles straight
// back so the live, interactive mockup is unaffected afterward.
function expandScrollRegions(doc: Document): () => void {
  const win = doc.defaultView
  const saved: SavedRegionStyle[] = []
  if (!win) return () => {}
  doc.body.querySelectorAll<HTMLElement>('*').forEach((el) => {
    if (el.scrollHeight <= el.clientHeight + 1) return
    const style = win.getComputedStyle(el)
    if (style.overflowY !== 'auto' && style.overflowY !== 'scroll') return
    saved.push({ el, overflow: el.style.overflow, overflowY: el.style.overflowY, maxHeight: el.style.maxHeight })
    el.style.setProperty('overflow', 'visible', 'important')
    el.style.setProperty('overflow-y', 'visible', 'important')
    el.style.setProperty('max-height', 'none', 'important')
  })
  return () => {
    saved.forEach(({ el, overflow, overflowY, maxHeight }) => {
      el.style.overflow = overflow
      el.style.overflowY = overflowY
      el.style.maxHeight = maxHeight
    })
  }
}

// Captures the full page, including content that only lives inside nested
// scroll regions — not just what's visible in the iframe's current box.
// Temporarily grows the iframe and any internal scrollers to their full
// content size, shoots that, then restores both to how they were so the
// live mockup keeps behaving (and scrolling) exactly as before.
export async function captureScreenshot(iframe: HTMLIFrameElement, idoc: Document): Promise<Blob | null> {
  const restoreHeight = iframe.style.height
  try {
    await nextPaint()
    await new Promise((r) => setTimeout(r, 150))

    const restoreRegions = expandScrollRegions(idoc)
    void idoc.body.offsetHeight
    const w = iframe.getBoundingClientRect().width
    const h = Math.min(Math.max(idoc.documentElement.scrollHeight, 1), CAPTURE_MAX_HEIGHT)
    iframe.style.height = `${h}px`
    void iframe.offsetHeight

    const canvas = await html2canvas(idoc.documentElement, {
      backgroundColor: null,
      scale: 1,
      logging: false,
      useCORS: true,
      width: w,
      height: h,
      windowWidth: w,
      windowHeight: h,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
    })

    restoreRegions()
    iframe.style.height = restoreHeight
    void iframe.offsetHeight

    return await new Promise<Blob | null>((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85))
  } catch {
    iframe.style.height = restoreHeight
    return null
  }
}
