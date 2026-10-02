import { useEffect, useState, type ClipboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import type { ManifestEntry } from '@/types/project'

interface ManifestEntryFormProps {
  entry: ManifestEntry
  screenshotUrl: string | null
  onChange: (patch: Partial<ManifestEntry>) => void
  onScreenshot: (file: Blob) => void
  onRemoveScreenshot: () => void
  onDelete: () => void
}

const inputClass = 'rounded-md border border-input bg-secondary px-2 py-1.5 text-foreground'

export function ManifestEntryForm({
  entry,
  screenshotUrl,
  onChange,
  onScreenshot,
  onRemoveScreenshot,
  onDelete,
}: ManifestEntryFormProps) {
  const [name, setName] = useState(entry.name)
  const [keywords, setKeywords] = useState(entry.keywords.join(', '))

  useEffect(() => {
    setName(entry.name)
    setKeywords(entry.keywords.join(', '))
  }, [entry.name, entry.keywords])

  const handlePaste = (e: ClipboardEvent) => {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith('image/'))
    const file = item?.getAsFile()
    if (file) {
      e.preventDefault()
      onScreenshot(file)
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-3 p-6 text-xs" onPaste={handlePaste}>
      <label className="flex flex-col gap-1">
        <span className="text-muted-foreground">Name</span>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => onChange({ name })}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-muted-foreground">Keywords (comma separated, matched against tag + class names)</span>
        <input
          className={inputClass}
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          onBlur={() =>
            onChange({
              keywords: keywords
                .split(',')
                .map((k) => k.trim())
                .filter(Boolean),
            })
          }
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-muted-foreground">URL</span>
        <input
          className={inputClass}
          placeholder="https://bitbucket.../button.tsx"
          value={entry.url}
          onChange={(e) => onChange({ url: e.target.value })}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-muted-foreground">Description</span>
        <textarea
          className={`min-h-24 resize-y ${inputClass}`}
          value={entry.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-muted-foreground">Reference screenshot — shown in the report wherever this component is matched</span>
        {screenshotUrl ? (
          <img src={screenshotUrl} alt={entry.name} className="max-h-80 self-start rounded-md border border-border object-contain" />
        ) : (
          <div className="rounded-md border border-dashed border-border px-3 py-6 text-center text-muted-foreground">
            No screenshot yet — upload one, or paste an image anywhere on this form.
          </div>
        )}
        <div className="flex gap-2">
          <label className="cursor-pointer rounded-md border border-border px-2.5 py-1.5 hover:bg-accent">
            {screenshotUrl ? 'Replace…' : 'Upload…'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onScreenshot(file)
                e.target.value = ''
              }}
            />
          </label>
          {screenshotUrl && (
            <Button variant="ghost" size="sm" onClick={onRemoveScreenshot}>
              Remove
            </Button>
          )}
        </div>
      </div>

      <Button variant="ghost" size="sm" className="self-start text-destructive" onClick={onDelete}>
        Delete component
      </Button>
    </div>
  )
}
