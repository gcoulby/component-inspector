import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { BlockOverlay } from '@/components/canvas/BlockOverlay'
import { collectDetectableElements, findInteresting, autoLabel, traceLabelFor } from '@/lib/detection/dom'
import { fingerprintOf } from '@/lib/detection/fingerprint'
import { MIN_FRAME_HEIGHT, resizeIframeToContent } from '@/lib/iframeResize'
import { captureScreenshot } from '@/lib/screenshot'
import { debounce } from '@/lib/debounce'
import { useLiveSessionStore } from '@/store/liveSessionStore'
import { useToastStore } from '@/store/toastStore'
import type { DetectionFilters } from '@/data/detectionHeuristics'
import type { ProjectComponent, RectPct, View } from '@/types/project'

const FRAME_WIDTH = 1280
const SETTLE_DEBOUNCE_MS = 350

interface HoverState {
  rect: DOMRect
  label: string
}

export interface InteractiveWorkspaceHandle {
  autoDetect: () => void
  saveView: () => void
}

interface InteractiveWorkspaceProps {
  filters: DetectionFilters
  views: View[]
  components: ProjectComponent[]
  selectedComponentId: string | null
  onCommitView: (html: string, screenshotBlob: Blob | null) => { viewId: string; name: string }
  onAddBlock: (viewId: string, node: Element, frame: DOMRect) => string | null
  onAutoDetectView: (viewId: string, elements: Element[], frame: DOMRect) => number
  onFlowLine: (from: string, to: string, label: string) => void
  onSelectComponent: (componentId: string) => void
  onRectChange: (viewId: string, blockId: string, rectPct: RectPct) => void
}

// The only place a mockup ever actually runs — every saved view comes from
// here, either auto-captured while recording or boxed/saved on demand.
// Static views elsewhere are frozen screenshots of what got committed here.
export const InteractiveWorkspace = forwardRef<InteractiveWorkspaceHandle, InteractiveWorkspaceProps>(
  function InteractiveWorkspace(
    {
      filters,
      views,
      components,
      selectedComponentId,
      onCommitView,
      onAddBlock,
      onAutoDetectView,
      onFlowLine,
      onSelectComponent,
      onRectChange,
    },
    ref,
  ) {
    const rootHtml = useLiveSessionStore((s) => s.rootHtml)
    const setRootHtml = useLiveSessionStore((s) => s.setRootHtml)
    const recording = useLiveSessionStore((s) => s.recording)
    const setRecording = useLiveSessionStore((s) => s.setRecording)
    const inspectMode = useLiveSessionStore((s) => s.inspectMode)
    const showBoxes = useLiveSessionStore((s) => s.showBoxes)

    const toast = useToastStore((s) => s.show)
    const [pasting, setPasting] = useState(false)
    const [pasteText, setPasteText] = useState('')
    const [frameHeight, setFrameHeight] = useState(MIN_FRAME_HEIGHT)
    const [hover, setHover] = useState<HoverState | null>(null)
    const [currentViewId, setCurrentViewId] = useState<string | null>(null)

    const iframeRef = useRef<HTMLIFrameElement>(null)
    const frameWrapRef = useRef<HTMLDivElement>(null)
    const observerRef = useRef<MutationObserver | null>(null)
    const currentViewIdRef = useRef<string | null>(null)
    const currentFpRef = useRef<string | null>(null)
    const currentNameRef = useRef<string | null>(null)
    const pendingLabelRef = useRef<string | null>(null)

    const recordingRef = useRef(recording)
    const filtersRef = useRef(filters)
    const inspectModeRef = useRef(inspectMode)
    useEffect(() => {
      recordingRef.current = recording
    }, [recording])
    useEffect(() => {
      filtersRef.current = filters
    }, [filters])
    useEffect(() => {
      inspectModeRef.current = inspectMode
    }, [inspectMode])

    const setCurrentView = (viewId: string | null) => {
      currentViewIdRef.current = viewId
      setCurrentViewId(viewId)
    }

    // Commits the currently-displayed screen as a view exactly once — repeat
    // calls (another box added, auto-detect run again) reuse the same view id
    // instead of creating duplicates, until navigation resets the tracking.
    const ensureCommitted = useCallback(async (): Promise<string | null> => {
      if (currentViewIdRef.current) return currentViewIdRef.current
      const iframe = iframeRef.current
      const idoc = iframe?.contentDocument
      if (!iframe || !idoc) return null

      // Re-measure right before every capture, not just at initial load — an
      // SPA-style mockup can grow taller via DOM mutations alone (no reload),
      // and a stale, too-short iframe rect makes html2canvas crop the page.
      setFrameHeight(resizeIframeToContent(iframe, idoc))
      const html = idoc.documentElement.outerHTML
      const screenshotBlob = await captureScreenshot(iframe, idoc)
      const { viewId, name } = onCommitView(html, screenshotBlob)

      setCurrentView(viewId)
      currentFpRef.current = fingerprintOf(idoc)
      currentNameRef.current = name
      toast(recordingRef.current ? `Recording — saved "${name}"` : `Saved "${name}"`)
      return viewId
    }, [onCommitView, toast])

    const handleSettle = useRef<() => void>(() => {})
    useEffect(() => {
      handleSettle.current = debounce(() => {
        const idoc = iframeRef.current?.contentDocument
        if (!idoc || !recordingRef.current) return
        const fp = fingerprintOf(idoc)
        if (fp === currentFpRef.current) return

        const outgoingName = currentNameRef.current
        const outgoingLabel = pendingLabelRef.current
        setCurrentView(null)
        currentFpRef.current = null
        currentNameRef.current = null
        pendingLabelRef.current = null

        void ensureCommitted().then((viewId) => {
          if (!viewId) return
          if (outgoingName) onFlowLine(outgoingName, currentNameRef.current ?? '', outgoingLabel || 'Click')
          const iframe = iframeRef.current
          const freshDoc = iframe?.contentDocument
          if (iframe && freshDoc) {
            const frame = iframe.getBoundingClientRect()
            onAutoDetectView(viewId, collectDetectableElements(freshDoc, filtersRef.current), frame)
          }
        })
      }, SETTLE_DEBOUNCE_MS)
    }, [ensureCommitted, onFlowLine, onAutoDetectView])

    const handleFrameLoad = useCallback(() => {
      const iframe = iframeRef.current
      const idoc = iframe?.contentDocument
      if (!iframe || !idoc) return

      setFrameHeight(resizeIframeToContent(iframe, idoc))
      setCurrentView(null)
      currentFpRef.current = null
      currentNameRef.current = null
      pendingLabelRef.current = null

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
          void ensureCommitted().then((viewId) => {
            if (!viewId) return
            const frame = iframeRef.current?.getBoundingClientRect()
            if (!frame) return
            const componentId = onAddBlock(viewId, target, frame)
            if (componentId) onSelectComponent(componentId)
          })
        },
        true,
      )

      idoc.addEventListener(
        'click',
        (e) => {
          if (inspectModeRef.current || !recordingRef.current) return
          pendingLabelRef.current = traceLabelFor(e.target as Element)
        },
        true,
      )

      observerRef.current?.disconnect()
      const observer = new MutationObserver(() => handleSettle.current())
      observer.observe(idoc.body, { childList: true, subtree: true, attributes: true, characterData: true })
      observerRef.current = observer

      if (recordingRef.current) void ensureCommitted()
    }, [ensureCommitted, onAddBlock, onSelectComponent])

    useEffect(() => () => observerRef.current?.disconnect(), [])

    // Recording is toggled from the global toolbar now, not a button owned by
    // this component — react to the transition instead, so turning it on
    // still captures a baseline screen wherever the toggle happened.
    const prevRecordingRef = useRef(recording)
    useEffect(() => {
      const justEnabled = recording && !prevRecordingRef.current
      prevRecordingRef.current = recording
      if (!justEnabled || currentViewIdRef.current || !iframeRef.current?.contentDocument) return
      void ensureCommitted().then((viewId) => {
        if (!viewId) return
        const iframe = iframeRef.current
        const idoc = iframe?.contentDocument
        if (iframe && idoc) {
          const frame = iframe.getBoundingClientRect()
          onAutoDetectView(viewId, collectDetectableElements(idoc, filtersRef.current), frame)
        }
      })
    }, [recording, ensureCommitted, onAutoDetectView])

    const handleAutoDetect = useCallback(() => {
      void ensureCommitted().then((viewId) => {
        if (!viewId) return
        const iframe = iframeRef.current
        const idoc = iframe?.contentDocument
        if (!iframe || !idoc) return
        const frame = iframe.getBoundingClientRect()
        const added = onAutoDetectView(viewId, collectDetectableElements(idoc, filtersRef.current), frame)
        toast(added > 0 ? `Added ${added} detected block${added === 1 ? '' : 's'}` : 'Nothing new found — try Inspect mode for anything unusual')
      })
    }, [ensureCommitted, onAutoDetectView, toast])

    const handleSaveView = useCallback(() => {
      void ensureCommitted().then((viewId) => {
        if (!viewId) {
          toast('Load a mockup first')
          return
        }
        toast(`Saved "${currentNameRef.current}"`)
      })
    }, [ensureCommitted, toast])

    useImperativeHandle(ref, () => ({ autoDetect: handleAutoDetect, saveView: handleSaveView }), [
      handleAutoDetect,
      handleSaveView,
    ])

    const handleLoadRoot = () => {
      if (!pasteText.trim()) return
      setRootHtml(pasteText)
      setPasting(false)
      setPasteText('')
    }

    const currentView = views.find((v) => v.id === currentViewId) ?? null

    if (!rootHtml) {
      return (
        <main className="flex flex-1 flex-col items-center justify-center gap-3 overflow-auto bg-background p-6">
          {pasting ? (
            <div className="flex w-[600px] max-w-full flex-col gap-2">
              <textarea
                autoFocus
                className="h-56 w-full resize-y rounded-md border border-input bg-secondary p-2.5 font-mono text-xs text-foreground"
                placeholder="Paste the full HTML of the mockup — a single screen or a full SPA flow both work."
                spellCheck={false}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setPasting(false)}>
                  Cancel
                </Button>
                <Button size="sm" disabled={!pasteText.trim()} onClick={handleLoadRoot}>
                  Go live
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Paste your single-file mockup — a single screen or a full SPA flow both work. It loads live so you can
                click through it; start recording or hit &ldquo;Save view&rdquo; whenever you want to freeze the
                current screen.
              </p>
              <Button size="sm" onClick={() => setPasting(true)}>
                + Load mockup
              </Button>
            </>
          )}
        </main>
      )
    }

    return (
      <main className="flex flex-1 flex-col overflow-auto bg-[image:linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] bg-[size:24px_24px] bg-background">
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-background/95 px-3 py-1.5">
          <Button variant="ghost" size="sm" onClick={() => { setRecording(false); setRootHtml(null) }}>
            Change mockup
          </Button>
        </div>
        <div className="pointer-events-none sticky top-0 z-10 flex justify-center gap-2 pt-2">
          {inspectMode && (
            <span className="pointer-events-auto rounded-b-lg bg-live px-3 py-1 text-[11.5px] font-semibold text-[#1a0e04] shadow-lg">
              Inspect on — hover to highlight, click to box
            </span>
          )}
          {recording && (
            <span className="pointer-events-auto rounded-b-lg bg-rec px-3 py-1 text-[11.5px] font-semibold text-[#1a0505] shadow-lg">
              ⏺ Recording
            </span>
          )}
        </div>
        <div className="flex justify-center p-8">
          <div
            ref={frameWrapRef}
            className="relative shrink-0 overflow-hidden rounded bg-black shadow-[0_0_0_1px_hsl(var(--border)),0_24px_60px_rgba(0,0,0,0.5)]"
            style={{ width: FRAME_WIDTH, height: frameHeight }}
          >
            <iframe
              ref={iframeRef}
              title="Live mockup"
              srcDoc={rootHtml}
              sandbox="allow-same-origin allow-scripts"
              onLoad={handleFrameLoad}
              className="block w-full border-0 bg-white"
            />
            <div className="pointer-events-none absolute inset-0">
              {showBoxes &&
                currentView?.blocks.map((block) => {
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
                      frameRef={frameWrapRef}
                      onSelect={() => onSelectComponent(block.componentId)}
                      onRectChange={(rectPct) => currentViewId && onRectChange(currentViewId, block.id, rectPct)}
                    />
                  )
                })}
              {hover && (
                <div
                  className="pointer-events-none absolute rounded-sm border-2 border-dashed border-white bg-white/10"
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
  },
)
