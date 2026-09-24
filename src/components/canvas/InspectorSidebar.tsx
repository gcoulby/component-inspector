import { DetectionFilters } from '@/components/canvas/DetectionFilters'
import { ManifestEditor } from '@/components/canvas/ManifestEditor'
import { ViewFields } from '@/components/canvas/ViewFields'
import { ComponentList } from '@/components/canvas/ComponentList'
import { ComponentDetail } from '@/components/canvas/ComponentDetail'
import type { DetectionFilters as DetectionFiltersType } from '@/data/detectionHeuristics'
import type { ComponentCategory, DetectionCategory, ManifestEntry, ProjectComponent, View } from '@/types/project'

interface InspectorSidebarProps {
  filters: DetectionFiltersType
  onToggleFilter: (category: DetectionCategory) => void
  isInteractiveActive: boolean
  view: View | null
  views: View[]
  components: ProjectComponent[]
  manifest: ManifestEntry[]
  onManifestChange: (manifest: ManifestEntry[]) => void
  selectedComponentId: string | null
  onSelectComponent: (componentId: string) => void
  usedElsewhere: boolean
  onRenameView: (name: string) => void
  onViewDetailsChange: (details: string) => void
  onMergeView: (targetId: string) => void
  onRename: (label: string) => void
  onCategoryChange: (category: ComponentCategory) => void
  onMatchChange: (matchedName: string | null) => void
  onNotesChange: (notes: string) => void
  onRefUrlChange: (refUrl: string) => void
  onRemoveFromView: () => void
}

// Order matches the PoC's sidebar exactly: manifest, then the fields for
// whichever static view is selected, then detection filters (Interactive
// only — they drive live boxing, meaningless over a frozen screenshot),
// then the component list and detail panel.
export function InspectorSidebar({
  filters,
  onToggleFilter,
  isInteractiveActive,
  view,
  views,
  components,
  manifest,
  onManifestChange,
  selectedComponentId,
  onSelectComponent,
  usedElsewhere,
  onRenameView,
  onViewDetailsChange,
  onMergeView,
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
      <ManifestEditor manifest={manifest} onChange={onManifestChange} />
      {!isInteractiveActive && view && (
        <ViewFields
          view={view}
          otherViews={views.filter((v) => v.id !== view.id)}
          onRename={onRenameView}
          onDetailsChange={onViewDetailsChange}
          onMerge={onMergeView}
        />
      )}
      {isInteractiveActive && <DetectionFilters filters={filters} onToggle={onToggleFilter} />}
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
