import { Button } from '@/components/ui/button'
import { useProject } from '@/hooks/useProject'

export function ProjectToolbar() {
  const { project, isDirty, newProject, openProject, saveProject } = useProject()

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card px-3">
      <span className="text-sm font-semibold">
        Component <span className="text-primary">Inspector</span>
      </span>
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {project ? project.name : 'No project open'}
        {isDirty && <span className="h-1.5 w-1.5 rounded-full bg-primary" title="Unsaved changes" />}
      </span>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => newProject('Untitled project')}>
          New
        </Button>
        <Button variant="ghost" size="sm" onClick={() => void openProject()}>
          Open
        </Button>
        <Button variant="default" size="sm" disabled={!project} onClick={() => void saveProject()}>
          Save
        </Button>
      </div>
    </header>
  )
}
