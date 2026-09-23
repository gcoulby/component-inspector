import { Button } from '@/components/ui/button'

export function ProjectToolbar() {
  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card px-3">
      <span className="text-sm font-semibold">
        Component <span className="text-primary">Inspector</span>
      </span>
      <span className="text-sm text-muted-foreground">Untitled project</span>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm">
          New
        </Button>
        <Button variant="ghost" size="sm">
          Open
        </Button>
        <Button variant="default" size="sm">
          Save
        </Button>
      </div>
    </header>
  )
}
