import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { ManifestEntry } from '@/types/project'

interface ManifestEditorProps {
  manifest: ManifestEntry[]
  onChange: (manifest: ManifestEntry[]) => void
}

function isManifestEntryArray(value: unknown): value is ManifestEntry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (v) =>
        typeof v === 'object' &&
        v !== null &&
        typeof (v as ManifestEntry).name === 'string' &&
        Array.isArray((v as ManifestEntry).keywords) &&
        (v as ManifestEntry).keywords.every((k) => typeof k === 'string'),
    )
  )
}

export function ManifestEditor({ manifest, onChange }: ManifestEditorProps) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(() => JSON.stringify(manifest, null, 2))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setText(JSON.stringify(manifest, null, 2))
  }, [manifest])

  const handleBlur = () => {
    try {
      const parsed = JSON.parse(text)
      if (!isManifestEntryArray(parsed)) {
        setError('Expected a JSON array of { "name", "keywords": [...] }')
        return
      }
      setError(null)
      onChange(parsed)
    } catch {
      setError('Manifest JSON is invalid — not saved')
    }
  }

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground"
      >
        <span>Component library manifest</span>
        <span>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="flex flex-col gap-1.5 px-3 pb-3">
          <textarea
            spellCheck={false}
            className={cn(
              'min-h-32 resize-y rounded-md border bg-secondary p-2 font-mono text-[11px] text-foreground',
              error ? 'border-destructive' : 'border-input',
            )}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
          />
          {error ? (
            <span className="text-[11px] text-destructive">{error}</span>
          ) : (
            <span className="text-[11px] text-muted-foreground">
              JSON array of {'{'}"name","keywords":[...]{'}'}. Used only when a component is first discovered —
              treat the match as a first guess, not a verdict.
            </span>
          )}
        </div>
      )}
    </div>
  )
}
