import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CATEGORY_OPTIONS } from '@/data/categoryPresentation'
import { COMPONENT_COLOR_PALETTE } from '@/data/componentColors'
import type { ComponentCategory, ManifestEntry, ProjectComponent } from '@/types/project'

interface ComponentDetailProps {
  component: ProjectComponent | null
  manifest: ManifestEntry[]
  usedElsewhere: boolean
  onRename: (label: string) => void
  onCategoryChange: (category: ComponentCategory) => void
  onMatchChange: (matchedName: string | null) => void
  onColorChange: (color: string) => void
  onNotesChange: (notes: string) => void
  onRefUrlChange: (refUrl: string) => void
  onRemoveFromView: () => void
}

export function ComponentDetail({
  component,
  manifest,
  usedElsewhere,
  onRename,
  onCategoryChange,
  onMatchChange,
  onColorChange,
  onNotesChange,
  onRefUrlChange,
  onRemoveFromView,
}: ComponentDetailProps) {
  const [label, setLabel] = useState(component?.label ?? '')

  useEffect(() => {
    setLabel(component?.label ?? '')
  }, [component?.id, component?.label])

  if (!component) return null

  return (
    <div className="flex flex-col gap-2.5 border-t border-border p-3 text-xs">
      <label className="flex flex-col gap-1">
        <span className="text-muted-foreground">Component name</span>
        <input
          className="rounded-md border border-input bg-secondary px-2 py-1.5 text-foreground"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={() => onRename(label)}
        />
      </label>

      {usedElsewhere && (
        <div className="rounded-md border border-border bg-secondary/50 px-2 py-1.5 text-muted-foreground">
          This component is shared across views — changes here apply everywhere it appears.
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground">Category</span>
        <div className="flex gap-1">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onCategoryChange(opt.value)}
              className={cn(
                'flex-1 rounded-md border px-1.5 py-1 text-[11px]',
                component.category === opt.value
                  ? 'border-primary bg-primary/15 text-foreground'
                  : 'border-border text-muted-foreground',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-muted-foreground">Box color</span>
        <div className="flex flex-wrap gap-1">
          {COMPONENT_COLOR_PALETTE.map((hex) => (
            <button
              key={hex}
              title={hex}
              onClick={() => onColorChange(hex)}
              className={cn('h-5 w-5 rounded-sm border', component.color === hex ? 'border-white' : 'border-transparent')}
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </div>

      {component.category === 'matched' && (
        <select
          className="rounded-md border border-input bg-secondary px-2 py-1.5 text-foreground"
          value={component.matchedName ?? ''}
          onChange={(e) => onMatchChange(e.target.value || null)}
        >
          <option value="">— pick component —</option>
          {manifest.map((m) => (
            <option key={m.name} value={m.name}>
              {m.name}
            </option>
          ))}
        </select>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-muted-foreground">Reference URL</span>
        <input
          className="rounded-md border border-input bg-secondary px-2 py-1.5 text-foreground"
          placeholder="https://..."
          value={component.refUrl}
          onChange={(e) => onRefUrlChange(e.target.value)}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-muted-foreground">Notes</span>
        <textarea
          className="min-h-16 resize-y rounded-md border border-input bg-secondary px-2 py-1.5 text-foreground"
          placeholder="Anything worth remembering about this component..."
          value={component.notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </label>

      <Button variant="ghost" size="sm" onClick={onRemoveFromView}>
        Remove from this view
      </Button>
    </div>
  )
}
