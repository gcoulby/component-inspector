import { cn } from '@/lib/utils'
import { FILTER_LABELS, type DetectionFilters as DetectionFiltersType } from '@/data/detectionHeuristics'
import type { DetectionCategory } from '@/types/project'

interface DetectionFiltersProps {
  filters: DetectionFiltersType
  onToggle: (category: DetectionCategory) => void
}

export function DetectionFilters({ filters, onToggle }: DetectionFiltersProps) {
  return (
    <div className="flex flex-wrap gap-1.5 border-b border-border px-3 py-2.5">
      {(Object.keys(FILTER_LABELS) as DetectionCategory[]).map((key) => (
        <button
          key={key}
          onClick={() => onToggle(key)}
          className={cn(
            'rounded-full border px-2 py-0.5 text-xs',
            filters[key]
              ? 'border-primary/50 bg-primary/15 text-foreground'
              : 'border-border text-muted-foreground',
          )}
        >
          {FILTER_LABELS[key]}
        </button>
      ))}
    </div>
  )
}
