import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmModal } from '@/components/canvas/ConfirmModal'
import type { View } from '@/types/project'

interface ViewFieldsProps {
  view: View
  otherViews: View[]
  onRename: (name: string) => void
  onDetailsChange: (details: string) => void
  onMerge: (targetId: string) => void
}

// Only shown for a selected static view (never the Interactive tab) — lets
// you rename it, note behaviour worth remembering, and merge it into
// another view when recording captured the same real screen twice under
// different content.
export function ViewFields({ view, otherViews, onRename, onDetailsChange, onMerge }: ViewFieldsProps) {
  const [mergeTargetId, setMergeTargetId] = useState(otherViews[0]?.id ?? '')
  const [confirming, setConfirming] = useState(false)

  const targetName = otherViews.find((v) => v.id === mergeTargetId)?.name ?? ''

  return (
    <div className="border-b border-border p-3.5">
      <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-wide text-muted-faint">
        View name
      </label>
      <input
        type="text"
        value={view.name}
        onChange={(e) => onRename(e.target.value)}
        className="mb-2.5 w-full rounded-md border border-border-strong bg-secondary px-2.5 py-1.5 text-[13px] text-foreground"
      />
      <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-wide text-muted-faint">
        Details
      </label>
      <textarea
        value={view.details ?? ''}
        onChange={(e) => onDetailsChange(e.target.value)}
        placeholder="Notes about this screen — behaviour, edge cases, anything worth remembering."
        className="mb-2.5 min-h-[70px] w-full resize-y rounded-md border border-border-strong bg-secondary px-2.5 py-1.5 text-xs text-foreground"
      />
      {otherViews.length > 0 && (
        <>
          <label className="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-wide text-muted-faint">
            Merge into another view
          </label>
          <div className="flex gap-1.5">
            <select
              value={mergeTargetId}
              onChange={(e) => setMergeTargetId(e.target.value)}
              className="flex-1 rounded-md border border-border-strong bg-secondary px-2 py-1.5 text-xs text-foreground"
            >
              {otherViews.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
            <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
              Merge
            </Button>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-faint">
            Use this when the flow captured the same real screen twice under different content — the target view's
            own components are kept as the record for it; only its screenshot/details get filled in if it's missing
            them, and this view is removed.
          </p>
        </>
      )}
      <ConfirmModal
        open={confirming}
        message={`Merge "${view.name}" into "${targetName}"? This view will be deleted.`}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false)
          onMerge(mergeTargetId)
        }}
      />
    </div>
  )
}
