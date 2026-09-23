import { cn } from '@/lib/utils'

export type Mode = 'canvas' | 'flow'

interface ModeTabsProps {
  mode: Mode
  onModeChange: (mode: Mode) => void
}

const MODES: { id: Mode; label: string }[] = [
  { id: 'canvas', label: 'Canvas' },
  { id: 'flow', label: 'Flow & export' },
]

export function ModeTabs({ mode, onModeChange }: ModeTabsProps) {
  return (
    <div className="flex gap-0.5 rounded-lg bg-secondary p-0.5">
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => onModeChange(m.id)}
          className={cn(
            'rounded-md px-3 py-1 text-xs font-medium text-muted-foreground transition-colors',
            mode === m.id && 'bg-accent text-foreground',
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
