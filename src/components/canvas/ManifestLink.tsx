import { Button } from '@/components/ui/button'

interface ManifestLinkProps {
  count: number
  onOpen: () => void
}

export function ManifestLink({ count, onOpen }: ManifestLinkProps) {
  return (
    <div className="flex items-center justify-between border-b border-border px-3 py-2 text-xs">
      <span className="text-muted-foreground">Component library manifest ({count})</span>
      <Button size="sm" variant="accentOutline" onClick={onOpen}>
        Edit
      </Button>
    </div>
  )
}
