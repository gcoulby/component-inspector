import { DetectionFilters } from '@/components/canvas/DetectionFilters'
import { ManifestEditor } from '@/components/canvas/ManifestEditor'
import { ComponentList } from '@/components/canvas/ComponentList'
import { ComponentDetail } from '@/components/canvas/ComponentDetail'
import type { DetectionFilters as DetectionFiltersType } from '@/data/detectionHeuristics'
import type { ComponentCategory, DetectionCategory, ManifestEntry, ProjectComponent, View } from '@/types/project'

interface InspectorSidebarProps {
  filters: DetectionFiltersType
  onToggleFilter: (category: DetectionCategory) => void
  view: View | null
  components: ProjectComponent[]
  manifest: ManifestEntry[]
  onManifestChange: (manifest: ManifestEntry[]) => void
  selectedComponentId: string | null
  onSelectComponent: (componentId: string) => void
  usedElsewhere: boolean
  onRename: (label: string) => void
  onCategoryChange: (category: ComponentCategory) => void
  onMatchChange: (matchedName: string | null) => void
  onNotesChange: (notes: string) => void
  onRefUrlChange: (refUrl: string) => void
  onRemoveFromView: () => void
}

export function InspectorSidebar({
  filters,
  onToggleFilter,
  view,
  components,
  manifest,
  onManifestChange,
  selectedComponentId,
  onSelectComponent,
  usedElsewhere,
  onRename,
  onCategoryChange,
  onMatchChange,
  onNotesChange,
  onRefUrlChange,
  onRemoveFromView,
}: InspectorSidebarProps) {
  const selectedComponent = components.find((c) => c.id === selectedComponentId) ?? null

  return (
    <aside className="flex w-72 shrink-0 flex-col overflow-y-auto border-l border-border bg-card">
      <DetectionFilters filters={filters} onToggle={onToggleFilter} />
      <ManifestEditor manifest={manifest} onChange={onManifestChange} />
      <ComponentList
        view={view}
        components={components}
        selectedComponentId={selectedComponentId}
        onSelect={onSelectComponent}
      />
      <ComponentDetail
        component={selectedComponent}
        manifest={manifest}
        usedElsewhere={usedElsewhere}
        onRename={onRename}
        onCategoryChange={onCategoryChange}
        onMatchChange={onMatchChange}
        onNotesChange={onNotesChange}
        onRefUrlChange={onRefUrlChange}
        onRemoveFromView={onRemoveFromView}
      />
    </aside>
  )
}
