import { useEffect, useMemo, useState } from 'react'
import { ViewsSidebar } from '@/components/canvas/ViewsSidebar'
import { MockupCanvas } from '@/components/canvas/MockupCanvas'
import { InteractiveWorkspace } from '@/components/canvas/InteractiveWorkspace'
import { InspectorSidebar } from '@/components/canvas/InspectorSidebar'
import { LoadMockupModal } from '@/components/canvas/LoadMockupModal'
import { useProject } from '@/hooks/useProject'
import { useDetection } from '@/hooks/useDetection'
import { DEFAULT_FILTERS } from '@/data/detectionHeuristics'
import { LIVE_VIEW_ID } from '@/lib/liveSession'
import type { ComponentCategory, DetectionCategory } from '@/types/project'

export function CanvasPage() {
  const { project, assets, addView, deleteView, commitView, addFlowLine, updateProject } = useProject()
  const {
    addOrSelectBlockAt,
    autoDetectAt,
    renameComponentAt,
    setComponentCategoryAt,
    setComponentMatchAt,
    setComponentNotesAt,
    setComponentRefUrlAt,
    removeBlockFromViewAt,
  } = useDetection()

  const [activeViewId, setActiveViewId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [mockupHtml, setMockupHtml] = useState<string | null>(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)

  const views = useMemo(() => project?.views ?? [], [project?.views])
  const components = project?.components ?? []
  const manifest = project?.manifest ?? []
  const activeView = views.find((v) => v.id === activeViewId) ?? null

  useEffect(() => {
    if (activeViewId === LIVE_VIEW_ID) return
    if (!activeViewId && views.length > 0) {
      setActiveViewId(views[0].id)
    } else if (activeViewId && !views.some((v) => v.id === activeViewId)) {
      setActiveViewId(views[0]?.id ?? null)
    }
  }, [views, activeViewId])

  useEffect(() => {
    setSelectedComponentId(null)
  }, [activeViewId])

  useEffect(() => {
    if (!activeView) {
      setMockupHtml(null)
      return
    }
    const blob = assets.get(`assets/${activeView.htmlAssetId}.html`)
    if (!blob) {
      setMockupHtml(null)
      return
    }
    let cancelled = false
    blob.text().then((text) => {
      if (!cancelled) setMockupHtml(text)
    })
    return () => {
      cancelled = true
    }
  }, [activeView, assets])

  const handleLoadMockup = (html: string) => {
    const newViewId = addView(html)
    setActiveViewId(newViewId)
    setModalOpen(false)
  }

  const handleAddBlock = (node: Element, frame: DOMRect) => {
    if (!activeView) return
    const componentId = addOrSelectBlockAt(activeView.id, node, frame)
    if (componentId) setSelectedComponentId(componentId)
  }

  const handleAutoDetect = (elements: Element[], frame: DOMRect): number => {
    if (!activeView) return 0
    return autoDetectAt(activeView.id, elements, frame)
  }

  const handleToggleFilter = (category: DetectionCategory) => {
    setFilters((prev) => ({ ...prev, [category]: !prev[category] }))
  }

  const handleRemoveFromView = () => {
    if (!activeView || !selectedComponentId) return
    removeBlockFromViewAt(activeView.id, selectedComponentId)
    setSelectedComponentId(null)
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
        onSelect={setActiveViewId}
        onDelete={deleteView}
        onAdd={() => setModalOpen(true)}
      />
      {activeViewId === LIVE_VIEW_ID ? (
        <InteractiveWorkspace
          filters={filters}
          onCommitView={commitView}
          onAutoDetectView={autoDetectAt}
          onFlowLine={addFlowLine}
        />
      ) : (
        <MockupCanvas
          view={activeView}
          mockupHtml={mockupHtml}
          filters={filters}
          components={components}
          selectedComponentId={selectedComponentId}
          onAddBlock={handleAddBlock}
          onAutoDetect={handleAutoDetect}
          onSelectComponent={setSelectedComponentId}
          onLoadMockupClick={() => setModalOpen(true)}
        />
      )}
      <InspectorSidebar
        filters={filters}
        onToggleFilter={handleToggleFilter}
        view={activeView}
        components={components}
        manifest={manifest}
        onManifestChange={(newManifest) => updateProject((p) => ({ ...p, manifest: newManifest }))}
        selectedComponentId={selectedComponentId}
        onSelectComponent={setSelectedComponentId}
        usedElsewhere={usedElsewhere}
        onRename={(label) => selectedComponentId && renameComponentAt(selectedComponentId, label)}
        onCategoryChange={(category: ComponentCategory) =>
          selectedComponentId && setComponentCategoryAt(selectedComponentId, category)
        }
        onMatchChange={(matchedName) => selectedComponentId && setComponentMatchAt(selectedComponentId, matchedName)}
        onNotesChange={(notes) => selectedComponentId && setComponentNotesAt(selectedComponentId, notes)}
        onRefUrlChange={(refUrl) => selectedComponentId && setComponentRefUrlAt(selectedComponentId, refUrl)}
        onRemoveFromView={handleRemoveFromView}
      />
      <LoadMockupModal open={modalOpen} onClose={() => setModalOpen(false)} onLoad={handleLoadMockup} />
    </div>
  )
}
