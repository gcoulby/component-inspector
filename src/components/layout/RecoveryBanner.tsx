import { Button } from '@/components/ui/button'
import { useProject } from '@/hooks/useProject'

export function RecoveryBanner() {
  const { recoverableSnapshot, recoverSnapshot, discardSnapshot } = useProject()

  if (!recoverableSnapshot) return null

  const savedAt = new Date(recoverableSnapshot.savedAt).toLocaleString()

  return (
    <div className="flex items-center gap-3 border-b border-border bg-accent px-3 py-1.5 text-sm">
      <span>
        Recovered unsaved work from <span className="font-medium">{recoverableSnapshot.project.name}</span>, autosaved {savedAt}.
      </span>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={discardSnapshot}>
          Discard
        </Button>
        <Button variant="default" size="sm" onClick={recoverSnapshot}>
          Recover
        </Button>
      </div>
    </div>
  )
}
