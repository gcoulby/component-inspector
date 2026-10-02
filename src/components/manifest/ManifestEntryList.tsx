import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ManifestEntry } from '@/types/project'

interface ManifestEntryListProps {
  manifest: ManifestEntry[]
  selectedName: string | null
  onSelect: (name: string) => void
  onAdd: () => void
}

export function ManifestEntryList({ manifest, selectedName, onSelect, onAdd }: ManifestEntryListProps) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">Library components ({manifest.length})</span>
        <Button size="sm" variant="accentOutline" onClick={onAdd}>
          + Add
        </Button>
      </div>
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-1.5">
        {manifest.map((m) => (
          <button
            key={m.name}
            onClick={() => onSelect(m.name)}
            className={cn(
              'flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs',
              m.name === selectedName ? 'bg-accent' : 'hover:bg-accent/50',
            )}
          >
            <span className="flex-1 truncate text-foreground">{m.name}</span>
            {m.screenshotAssetId && <span title="Has a reference screenshot">🖼️</span>}
          </button>
        ))}
        {manifest.length === 0 && <div className="px-2 py-2 text-xs text-muted-foreground">No components yet.</div>}
      </div>
    </aside>
  )
}
