import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { collectDetectableElements, traceLabelFor } from '@/lib/detection/dom'
import { fingerprintOf } from '@/lib/detection/fingerprint'
import { MIN_FRAME_HEIGHT, resizeIframeToContent } from '@/lib/iframeResize'
import { captureScreenshot } from '@/lib/screenshot'
import { debounce } from '@/lib/debounce'
import { useLiveSessionStore } from '@/store/liveSessionStore'
import type { DetectionFilters } from '@/data/detectionHeuristics'

const FRAME_WIDTH = 1280
const SETTLE_DEBOUNCE_MS = 350

interface InteractiveWorkspaceProps {
  filters: DetectionFilters
  onCommitView: (html: string, screenshotBlob: Blob | null) => { viewId: string; name: string }
  onAutoDetectView: (viewId: string, elements: Element[], frame: DOMRect) => number
  onFlowLine: (from: string, to: string, label: string) => void
}

export function InteractiveWorkspace({
  filters,
  onCommitView,
  onAutoDetectView,
  onFlowLine,
}: InteractiveWorkspaceProps) {
  const rootHtml = useLiveSessionStore((s) => s.rootHtml)
  const setRootHtml = useLiveSessionStore((s) => s.setRootHtml)
  const recording = useLiveSessionStore((s) => s.recording)
  const setRecording = useLiveSessionStore((s) => s.setRecording)

  const [pasting, setPasting] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const [frameHeight, setFrameHeight] = useState(MIN_FRAME_HEIGHT)
  const [status, setStatus] = useState<string | null>(null)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const observerRef = useRef<MutationObserver | null>(null)
  const busyRef = useRef(false)
  const currentFpRef = useRef<string | null>(null)
  const currentNameRef = useRef<string | null>(null)
  const pendingLabelRef = useRef<string | null>(null)

  const recordingRef = useRef(recording)
  const filtersRef = useRef(filters)
  useEffect(() => {
    recordingRef.current = recording
  }, [recording])
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  useEffect(() => {
    if (!status) return
    const timer = setTimeout(() => setStatus(null), 4000)
    return () => clearTimeout(timer)
  }, [status])

  const commitCurrentScreen = useCallback(
    async (isManualSave: boolean) => {
      const iframe = iframeRef.current
      const idoc = iframe?.contentDocument
      if (!iframe || !idoc || busyRef.current) return
      busyRef.current = true
      try {
        const h = resizeIframeToContent(iframe, idoc)
        setFrameHeight(h)
        const frame = iframe.getBoundingClientRect()
        const html = idoc.documentElement.outerHTML
        const screenshotBlob = await captureScreenshot(idoc, frame.width, frame.height)

        const outgoingName = currentNameRef.current
        const outgoingLabel = pendingLabelRef.current

        const { viewId, name } = onCommitView(html, screenshotBlob)
        onAutoDetectView(viewId, collectDetectableElements(idoc, filtersRef.current), frame)

        if (!isManualSave && outgoingName) {
          onFlowLine(outgoingName, name, outgoingLabel || 'Click')
        }

        currentFpRef.current = fingerprintOf(idoc)
        currentNameRef.current = name
        pendingLabelRef.current = null
        setStatus(isManualSave ? `Saved "${name}"` : `Recording — saved "${name}"`)
      } finally {
        busyRef.current = false
      }
    },
    [onCommitView, onAutoDetectView, onFlowLine],
  )

  const handleSettle = useRef<() => void>(() => {})
  useEffect(() => {
    handleSettle.current = debounce(() => {
      const idoc = iframeRef.current?.contentDocument
      if (!idoc || !recordingRef.current) return
      const fp = fingerprintOf(idoc)
      if (fp === currentFpRef.current) return
      void commitCurrentScreen(false)
    }, SETTLE_DEBOUNCE_MS)
  }, [commitCurrentScreen])

  const handleFrameLoad = useCallback(() => {
    const iframe = iframeRef.current
    const idoc = iframe?.contentDocument
    if (!iframe || !idoc) return

    setFrameHeight(resizeIframeToContent(iframe, idoc))
    currentFpRef.current = null
    currentNameRef.current = null
    pendingLabelRef.current = null

    idoc.addEventListener(
      'click',
      (e) => {
        if (!recordingRef.current) return
        pendingLabelRef.current = traceLabelFor(e.target as Element)
      },
      true,
    )

    observerRef.current?.disconnect()
    const observer = new MutationObserver(() => handleSettle.current())
    observer.observe(idoc.body, { childList: true, subtree: true, attributes: true, characterData: true })
    observerRef.current = observer

    // Capture the starting screen immediately so recording has a baseline.
    if (recordingRef.current) void commitCurrentScreen(false)
  }, [commitCurrentScreen])

  useEffect(() => () => observerRef.current?.disconnect(), [])

  const handleToggleRecording = () => {
    const next = !recording
    setRecording(next)
    if (next && iframeRef.current?.contentDocument && !currentNameRef.current) {
      void commitCurrentScreen(false)
    }
  }

  const handleLoadRoot = () => {
    if (!pasteText.trim()) return
    setRootHtml(pasteText)
    setPasting(false)
    setPasteText('')
  }

  if (!rootHtml) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 overflow-auto bg-background p-6">
        {pasting ? (
          <div className="flex w-[600px] max-w-full flex-col gap-2">
            <textarea
              autoFocus
              className="h-56 w-full resize-y rounded-md border border-input bg-secondary p-2.5 font-mono text-xs text-foreground"
              placeholder="Paste the full HTML of a multi-screen mockup — click through it live here."
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
              Paste an interactive mockup to click through it live and record screens automatically.
            </p>
            <Button size="sm" onClick={() => setPasting(true)}>
              + Load live mockup
            </Button>
          </>
        )}
      </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col overflow-auto bg-background">
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <Button variant={recording ? 'default' : 'outline'} size="sm" onClick={handleToggleRecording}>
          {recording ? '⏺ Recording' : '⏺ Start recording'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => void commitCurrentScreen(true)}>
          💾 Save view
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setRecording(false)
            setRootHtml(null)
          }}
        >
          Change mockup
        </Button>
        {status && <span className="text-xs text-muted-foreground">{status}</span>}
      </div>
      <div className="flex justify-center p-6">
        <div className="relative shrink-0" style={{ width: FRAME_WIDTH, height: frameHeight }}>
          <iframe
            ref={iframeRef}
            title="Live mockup"
            srcDoc={rootHtml}
            sandbox="allow-same-origin allow-scripts"
            onLoad={handleFrameLoad}
            className="block w-full border-0 bg-white"
          />
        </div>
      </div>
    </main>
  )
}
