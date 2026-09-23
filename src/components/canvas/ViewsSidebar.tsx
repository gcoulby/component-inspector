import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LIVE_VIEW_ID } from '@/lib/liveSession'
import type { View } from '@/types/project'

interface ViewsSidebarProps {
  views: View[]
  activeViewId: string | null
  onSelect: (viewId: string) => void
  onDelete: (viewId: string) => void
  onAdd: () => void
}

export function ViewsSidebar({ views, activeViewId, onSelect, onDelete, onAdd }: ViewsSidebarProps) {
  return (
    <aside className="flex w-44 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center justify-between px-2 py-2">
        <span className="text-xs font-medium text-muted-foreground">Views</span>
        <button
          onClick={onAdd}
          className="rounded px-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          + Add
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-1.5">
        <div
          onClick={() => onSelect(LIVE_VIEW_ID)}
          className={cn(
            'mb-1 flex cursor-pointer items-center gap-1 rounded-md border border-dashed px-2 py-1.5 text-xs',
            activeViewId === LIVE_VIEW_ID
              ? 'border-primary bg-accent text-foreground'
              : 'border-border text-muted-foreground hover:bg-accent/50',
          )}
        >
          <span className="flex-1 truncate">▶ Live session</span>
        </div>
        {views.length === 0 && (
          <div className="px-1 py-2 text-center text-xs text-muted-foreground">No views yet</div>
        )}
        {views.map((view) => (
          <div
            key={view.id}
            onClick={() => onSelect(view.id)}
            className={cn(
              'group flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-xs',
              view.id === activeViewId ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/50',
            )}
          >
            <span className="flex-1 truncate">{view.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(view.id)
              }}
              className="hidden rounded p-0.5 hover:bg-destructive hover:text-destructive-foreground group-hover:block"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </aside>
  )
}
