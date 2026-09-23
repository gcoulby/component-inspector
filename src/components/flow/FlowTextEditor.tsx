interface FlowTextEditorProps {
  flowText: string
  onChange: (flowText: string) => void
  showImages: boolean
  onToggleImages: () => void
}

export function FlowTextEditor({ flowText, onChange, showImages, onToggleImages }: FlowTextEditorProps) {
  return (
    <div className="flex w-80 shrink-0 flex-col gap-2 border-r border-border p-3">
      <h3 className="text-sm font-medium">Flow between views</h3>
      <p className="text-xs text-muted-foreground">
        One line per transition: <code className="rounded bg-secondary px-1">View A -&gt; View B : trigger</code>.
        Lines are added automatically while recording.
      </p>
      <textarea
        spellCheck={false}
        className="min-h-48 flex-1 resize-y rounded-md border border-input bg-secondary p-2.5 font-mono text-xs leading-relaxed text-foreground"
        placeholder={'Landing page -> Find Source : Bitbucket card\nFind Source -> Locate manifest : Continue'}
        value={flowText}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        onClick={onToggleImages}
        className="self-start rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground data-[on=true]:border-primary/50 data-[on=true]:bg-primary/15 data-[on=true]:text-foreground"
        data-on={showImages}
      >
        🖼️ Thumbnails in diagram: {showImages ? 'on' : 'off'}
      </button>
    </div>
  )
}
