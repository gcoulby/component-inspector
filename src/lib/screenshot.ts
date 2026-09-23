import html2canvas from 'html2canvas'

// Two RAFs plus a short settle delay — layout needs to actually finish
// applying (fonts, reflow) before html2canvas walks the DOM, or captures
// come out mid-layout.
export function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
  })
}

export async function captureScreenshot(doc: Document, width: number, height: number): Promise<Blob | null> {
  try {
    await nextPaint()
    await new Promise((r) => setTimeout(r, 150))
    const canvas = await html2canvas(doc.documentElement, {
      backgroundColor: null,
      scale: 1,
      logging: false,
      useCORS: true,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
    })
    return await new Promise<Blob | null>((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.85))
  } catch {
    return null
  }
}
