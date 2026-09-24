import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LIVE_VIEW_ID } from '@/lib/liveSession'
import type { View } from '@/types/project'

interface ViewsSidebarProps {
  views: View[]
  activeViewId: string | null
  thumbnails: Map<string, string>
  onSelect: (viewId: string) => void
  onDelete: (viewId: string) => void
}

export function ViewsSidebar({ views, activeViewId, thumbnails, onSelect, onDelete }: ViewsSidebarProps) {
  return (
    <aside className="flex w-44 shrink-0 flex-col border-r border-border bg-card">
      <div className="shrink-0 border-b border-border p-1.5">
        <div
          onClick={() => onSelect(LIVE_VIEW_ID)}
          className={cn(
            'flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1.5 text-xs text-live',
            activeViewId === LIVE_VIEW_ID
              ? 'border-live bg-accent'
              : 'border-transparent hover:bg-accent/50',
          )}
        >
          <span className="flex-1 truncate">🖥️ Interactive</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-1.5 pt-1.5">
        {views.length === 0 && (
          <div className="px-1 py-2 text-center text-xs text-muted-foreground">No views yet</div>
        )}
        {views.map((view) => (
          <div
            key={view.id}
            onClick={() => onSelect(view.id)}
            className={cn(
              'group flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1.5 text-xs',
              view.id === activeViewId
                ? 'border-border-strong bg-accent text-foreground'
                : 'border-transparent text-muted-foreground hover:bg-accent/50',
            )}
          >
            {thumbnails.has(view.id) && (
              <img
                src={thumbnails.get(view.id)}
                alt=""
                className="h-5 w-7 shrink-0 rounded-sm border border-border object-cover"
              />
            )}
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
