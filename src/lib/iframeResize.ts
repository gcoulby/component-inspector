export const MIN_FRAME_HEIGHT = 500
export const MAX_FRAME_HEIGHT = 6000

// Reset to a fixed baseline before measuring, never to 0px — a shell built on
// min-height:100vh needs a real viewport to measure against, and never
// inherit the previous view's height or a vh-based layout won't shrink.
export function resizeIframeToContent(iframe: HTMLIFrameElement, idoc: Document): number {
  iframe.style.height = '1000px'
  void iframe.offsetHeight
  const h = Math.min(Math.max(idoc.documentElement.scrollHeight, MIN_FRAME_HEIGHT), MAX_FRAME_HEIGHT)
  iframe.style.height = `${h}px`
  return h
}
