import { cn } from '@/lib/utils'
import { CATEGORY_STYLES } from '@/data/categoryPresentation'
import type { ProjectComponent, View } from '@/types/project'

interface ComponentListProps {
  view: View | null
  components: ProjectComponent[]
  selectedComponentId: string | null
  onSelect: (componentId: string) => void
}

interface Group {
  component: ProjectComponent
  count: number
  tag: string
}

export function ComponentList({ view, components, selectedComponentId, onSelect }: ComponentListProps) {
  const groups: Group[] = []
  const seen = new Map<string, Group>()
  for (const block of view?.blocks ?? []) {
    const component = components.find((c) => c.id === block.componentId)
    if (!component) continue
    const existing = seen.get(component.id)
    if (existing) {
      existing.count++
      continue
    }
    const group: Group = { component, count: 1, tag: block.tag }
    seen.set(component.id, group)
    groups.push(group)
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="px-3 py-2 text-xs font-medium text-muted-foreground">Components ({groups.length})</div>
      {groups.length === 0 ? (
        <div className="px-3 py-2 text-xs text-muted-foreground">
          No components boxed on this view yet. Turn on Inspect and click one, or hit Auto-detect.
        </div>
      ) : (
        <div className="flex flex-col gap-0.5 px-1.5 pb-2">
          {groups.map((g) => (
            <button
              key={g.component.id}
              onClick={() => onSelect(g.component.id)}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs',
                g.component.id === selectedComponentId ? 'bg-accent' : 'hover:bg-accent/50',
              )}
            >
              <span className={cn('h-2 w-2 shrink-0 rounded-full', CATEGORY_STYLES[g.component.category].dot)} />
              <span className="flex-1 overflow-hidden">
                <span className="block truncate text-foreground">
                  {g.component.label}
                  {g.component.notes && ' 📝'}
                  {g.component.refUrl && ' 🔗'}
                </span>
                <span className="block truncate text-muted-foreground">
                  {g.component.matchedName ? `→ ${g.component.matchedName}` : g.tag}
                </span>
              </span>
              {g.count > 1 && <span className="text-muted-foreground">×{g.count}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
