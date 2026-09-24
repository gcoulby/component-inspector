import { Button } from '@/components/ui/button'
import { ModeTabs, type Mode } from '@/components/layout/ModeTabs'
import { useProject } from '@/hooks/useProject'
import { useLiveSessionStore } from '@/store/liveSessionStore'

interface ProjectToolbarProps {
  mode: Mode
  onModeChange: (mode: Mode) => void
  isInteractiveActive: boolean
  onLoadMockupClick: () => void
  onAutoDetect: () => void
  onSaveView: () => void
}

// One consolidated bar for everything — project lifecycle, mode switching,
// and the live-session controls — matching the PoC's single topbar instead
// of splitting these across several stacked rows.
export function ProjectToolbar({
  mode,
  onModeChange,
  isInteractiveActive,
  onLoadMockupClick,
  onAutoDetect,
  onSaveView,
}: ProjectToolbarProps) {
  const { project, isDirty, newProject, openProject, saveProject } = useProject()
  const rootHtml = useLiveSessionStore((s) => s.rootHtml)
  const recording = useLiveSessionStore((s) => s.recording)
  const setRecording = useLiveSessionStore((s) => s.setRecording)
  const inspectMode = useLiveSessionStore((s) => s.inspectMode)
  const setInspectMode = useLiveSessionStore((s) => s.setInspectMode)
  const showBoxes = useLiveSessionStore((s) => s.showBoxes)
  const setShowBoxes = useLiveSessionStore((s) => s.setShowBoxes)

  const liveControlsEnabled = !!project && isInteractiveActive && rootHtml !== null

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-card px-3">
      <span className="text-sm font-semibold">
        Component <span className="text-primary">Inspector</span>
      </span>
      <Button variant="ghost" size="sm" disabled={!project} onClick={onLoadMockupClick}>
        + Load mockup
      </Button>
      <ModeTabs mode={mode} onModeChange={onModeChange} />

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant={recording ? 'recActive' : 'recOutline'}
          size="sm"
          disabled={!liveControlsEnabled}
          onClick={() => setRecording(!recording)}
        >
          {recording ? '⏺ Recording' : '⏺ Start recording'}
        </Button>
        <Button
          variant={inspectMode ? 'accentActive' : 'accentOutline'}
          size="sm"
          disabled={!liveControlsEnabled}
          onClick={() => setInspectMode(!inspectMode)}
        >
          Inspect: {inspectMode ? 'on' : 'off'}
        </Button>
        <Button variant="outline" size="sm" disabled={!project} onClick={() => setShowBoxes(!showBoxes)}>
          Boxes: {showBoxes ? 'on' : 'off'}
        </Button>
        <Button variant="outline" size="sm" disabled={!liveControlsEnabled} onClick={onAutoDetect}>
          Auto-detect
        </Button>
        <Button variant="outline" size="sm" disabled={!liveControlsEnabled} onClick={onSaveView}>
          💾 Save view
        </Button>
      </div>

      <div className="ml-2 flex items-center gap-2 border-l border-border pl-3">
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {project ? project.name : 'No project open'}
          {isDirty && <span className="h-1.5 w-1.5 rounded-full bg-primary" title="Unsaved changes" />}
        </span>
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
