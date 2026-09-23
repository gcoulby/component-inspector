import { DetectionFilters } from '@/components/canvas/DetectionFilters'
import type { DetectionFilters as DetectionFiltersType } from '@/data/detectionHeuristics'
import type { DetectionCategory } from '@/types/project'

interface InspectorSidebarProps {
  filters: DetectionFiltersType
  onToggleFilter: (category: DetectionCategory) => void
}

export function InspectorSidebar({ filters, onToggleFilter }: InspectorSidebarProps) {
  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-border bg-card">
      <DetectionFilters filters={filters} onToggle={onToggleFilter} />
      <div className="px-3 py-2 text-xs text-muted-foreground">
        Manifest editor and component list will live here.
      </div>
    </aside>
  )
}
