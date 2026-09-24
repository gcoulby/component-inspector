import { useEffect, useMemo, useState, type RefObject } from 'react'
import { ViewsSidebar } from '@/components/canvas/ViewsSidebar'
import { MockupCanvas } from '@/components/canvas/MockupCanvas'
import { InteractiveWorkspace, type InteractiveWorkspaceHandle } from '@/components/canvas/InteractiveWorkspace'
import { InspectorSidebar } from '@/components/canvas/InspectorSidebar'
import { LoadMockupModal } from '@/components/canvas/LoadMockupModal'
import { useProject } from '@/hooks/useProject'
import { useDetection } from '@/hooks/useDetection'
import { useLiveSessionStore } from '@/store/liveSessionStore'
import { useToastStore } from '@/store/toastStore'
import { DEFAULT_FILTERS } from '@/data/detectionHeuristics'
import { LIVE_VIEW_ID } from '@/lib/liveSession'
import type { ComponentCategory, DetectionCategory, RectPct } from '@/types/project'

interface CanvasPageProps {
  activeViewId: string
  onActiveViewIdChange: (viewId: string) => void
  modalOpen: boolean
  onModalOpenChange: (open: boolean) => void
  workspaceRef: RefObject<InteractiveWorkspaceHandle>
}

export function CanvasPage({
  activeViewId,
  onActiveViewIdChange,
  modalOpen,
  onModalOpenChange,
  workspaceRef,
}: CanvasPageProps) {
  const { project, assets, deleteView, renameView, setViewDetails, mergeViews, commitView, addFlowLine, updateProject } =
    useProject()
  const {
    addOrSelectBlockAt,
    autoDetectAt,
    renameComponentAt,
    setComponentCategoryAt,
    setComponentMatchAt,
    setComponentNotesAt,
    setComponentRefUrlAt,
    removeBlockFromViewAt,
    setComponentColorAt,
    setBlockRectAt,
    addManualBlockAt,
  } = useDetection()
  const setLiveRootHtml = useLiveSessionStore((s) => s.setRootHtml)
  const setLiveRecording = useLiveSessionStore((s) => s.setRecording)
  const toast = useToastStore((s) => s.show)

  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)

  const views = useMemo(() => project?.views ?? [], [project?.views])
  const components = project?.components ?? []
  const manifest = project?.manifest ?? []
  const activeView = views.find((v) => v.id === activeViewId) ?? null

  useEffect(() => {
    if (activeViewId === LIVE_VIEW_ID) return
    if (!views.some((v) => v.id === activeViewId)) {
      onActiveViewIdChange(LIVE_VIEW_ID)
    }
  }, [views, activeViewId, onActiveViewIdChange])

  useEffect(() => {
    setSelectedComponentId(null)
  }, [activeViewId])

  const thumbnails = useMemo(() => {
    const urls = new Map<string, string>()
    for (const view of views) {
      if (!view.screenshotAssetId) continue
      const blob = assets.get(`assets/${view.screenshotAssetId}.png`)
      if (blob) urls.set(view.id, URL.createObjectURL(blob))
    }
    return urls
  }, [views, assets])

  useEffect(() => {
    return () => {
      thumbnails.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [thumbnails])

  // The toolbar's only mockup-loading entry point — it always (re)starts the
  // Interactive session, matching the PoC where "+ Load mockup" never has
  // any other destination.
  const handleLoadMockup = (html: string) => {
    setLiveRecording(false)
    setLiveRootHtml(html)
    onActiveViewIdChange(LIVE_VIEW_ID)
    onModalOpenChange(false)
  }

  const handleToggleFilter = (category: DetectionCategory) => {
    setFilters((prev) => ({ ...prev, [category]: !prev[category] }))
  }

  const handleRemoveFromView = () => {
    if (!activeView || !selectedComponentId) return
    removeBlockFromViewAt(activeView.id, selectedComponentId)
    setSelectedComponentId(null)
  }

  const handleMergeView = (targetId: string) => {
    if (!activeView) return
    const targetName = views.find((v) => v.id === targetId)?.name ?? ''
    mergeViews(activeView.id, targetId)
    onActiveViewIdChange(targetId)
    toast(`Merged into "${targetName}"`)
  }

  const usedElsewhere =
    !!activeView &&
    !!selectedComponentId &&
    views.some((v) => v.id !== activeView.id && v.blocks.some((b) => b.componentId === selectedComponentId))

  if (!project) {
    return (
      <div className="flex flex-1 items-center justify-center overflow-hidden bg-background">
        <p className="text-sm text-muted-foreground">Start or open a project to load a mockup.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <ViewsSidebar
        views={views}
        activeViewId={activeViewId}
        thumbnails={thumbnails}
        onSelect={onActiveViewIdChange}
        onDelete={deleteView}
      />
      {/* Kept mounted even when a static view is selected, not conditionally
          rendered, so the live mockup never reloads just from switching views. */}
      <div className={activeViewId === LIVE_VIEW_ID ? 'contents' : 'hidden'}>
        <InteractiveWorkspace
          ref={workspaceRef}
          filters={filters}
          views={views}
          components={components}
          selectedComponentId={selectedComponentId}
          onCommitView={commitView}
          onAddBlock={addOrSelectBlockAt}
          onAutoDetectView={autoDetectAt}
          onFlowLine={addFlowLine}
          onSelectComponent={setSelectedComponentId}
          onRectChange={(viewId, blockId, rectPct) => setBlockRectAt(viewId, blockId, rectPct)}
        />
      </div>
      {activeViewId !== LIVE_VIEW_ID && activeView && (
        <MockupCanvas
          view={activeView}
          screenshotUrl={thumbnails.get(activeView.id) ?? null}
          components={components}
          selectedComponentId={selectedComponentId}
          onSelectComponent={setSelectedComponentId}
          onRectChange={(blockId, rectPct: RectPct) => setBlockRectAt(activeView.id, blockId, rectPct)}
          onDrawBlock={(rectPct: RectPct) => {
            const componentId = addManualBlockAt(activeView.id, rectPct)
            if (componentId) setSelectedComponentId(componentId)
          }}
        />
      )}
      <InspectorSidebar
        filters={filters}
        onToggleFilter={handleToggleFilter}
        isInteractiveActive={activeViewId === LIVE_VIEW_ID}
        view={activeView}
        views={views}
        components={components}
        manifest={manifest}
        onManifestChange={(newManifest) => updateProject((p) => ({ ...p, manifest: newManifest }))}
        selectedComponentId={selectedComponentId}
        onSelectComponent={setSelectedComponentId}
        usedElsewhere={usedElsewhere}
        onRenameView={(name) => activeView && renameView(activeView.id, name)}
        onViewDetailsChange={(details) => activeView && setViewDetails(activeView.id, details)}
        onMergeView={handleMergeView}
        onRename={(label) => selectedComponentId && renameComponentAt(selectedComponentId, label)}
        onCategoryChange={(category: ComponentCategory) =>
          selectedComponentId && setComponentCategoryAt(selectedComponentId, category)
        }
        onMatchChange={(matchedName) => selectedComponentId && setComponentMatchAt(selectedComponentId, matchedName)}
        onColorChange={(color) => selectedComponentId && setComponentColorAt(selectedComponentId, color)}
        onNotesChange={(notes) => selectedComponentId && setComponentNotesAt(selectedComponentId, notes)}
        onRefUrlChange={(refUrl) => selectedComponentId && setComponentRefUrlAt(selectedComponentId, refUrl)}
        onRemoveFromView={handleRemoveFromView}
      />
      <LoadMockupModal open={modalOpen} onClose={() => onModalOpenChange(false)} onLoad={handleLoadMockup} />
    </div>
  )
}
