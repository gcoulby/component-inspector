import { useEffect, useMemo, useState } from 'react'
import { ViewsSidebar } from '@/components/canvas/ViewsSidebar'
import { MockupCanvas } from '@/components/canvas/MockupCanvas'
import { InspectorSidebar } from '@/components/canvas/InspectorSidebar'
import { LoadMockupModal } from '@/components/canvas/LoadMockupModal'
import { useProject } from '@/hooks/useProject'
import { useDetection } from '@/hooks/useDetection'
import { DEFAULT_FILTERS } from '@/data/detectionHeuristics'
import type { DetectionCategory } from '@/types/project'

export function CanvasPage() {
  const { project, assets, addView, deleteView } = useProject()
  const { addOrSelectBlockAt, autoDetectAt } = useDetection()

  const [activeViewId, setActiveViewId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [mockupHtml, setMockupHtml] = useState<string | null>(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const views = useMemo(() => project?.views ?? [], [project?.views])
  const activeView = views.find((v) => v.id === activeViewId) ?? null

  useEffect(() => {
    if (!activeViewId && views.length > 0) {
      setActiveViewId(views[0].id)
    } else if (activeViewId && !views.some((v) => v.id === activeViewId)) {
      setActiveViewId(views[0]?.id ?? null)
    }
  }, [views, activeViewId])

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
    addOrSelectBlockAt(activeView.id, node, frame)
  }

  const handleAutoDetect = (elements: Element[], frame: DOMRect): number => {
    if (!activeView) return 0
    return autoDetectAt(activeView.id, elements, frame)
  }

  const handleToggleFilter = (category: DetectionCategory) => {
    setFilters((prev) => ({ ...prev, [category]: !prev[category] }))
  }

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
      <MockupCanvas
        view={activeView}
        mockupHtml={mockupHtml}
        filters={filters}
        onAddBlock={handleAddBlock}
        onAutoDetect={handleAutoDetect}
        onLoadMockupClick={() => setModalOpen(true)}
      />
      <InspectorSidebar filters={filters} onToggleFilter={handleToggleFilter} />
      <LoadMockupModal open={modalOpen} onClose={() => setModalOpen(false)} onLoad={handleLoadMockup} />
    </div>
  )
}
