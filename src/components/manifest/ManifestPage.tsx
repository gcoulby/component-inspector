import { useEffect, useMemo, useState } from 'react'
import { ManifestEntryList } from '@/components/manifest/ManifestEntryList'
import { ManifestEntryForm } from '@/components/manifest/ManifestEntryForm'
import { useProject } from '@/hooks/useProject'
import {
  addManifestEntry,
  createManifestEntry,
  removeManifestEntry,
  updateManifestEntry,
} from '@/lib/manifest/manifestEntries'

export function ManifestPage() {
  const { project, assets, updateProject, setAsset } = useProject()
  const [selectedName, setSelectedName] = useState<string | null>(null)

  const manifest = project?.manifest ?? []
  const entry = manifest.find((m) => m.name === selectedName) ?? manifest[0] ?? null

  const screenshotUrl = useMemo(() => {
    const blob = entry?.screenshotAssetId ? assets.get(`assets/${entry.screenshotAssetId}.png`) : undefined
    return blob ? URL.createObjectURL(blob) : null
  }, [entry?.screenshotAssetId, assets])

  useEffect(() => {
    return () => {
      if (screenshotUrl) URL.revokeObjectURL(screenshotUrl)
    }
  }, [screenshotUrl])

  if (!project) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Start or open a project to edit its manifest.</p>
      </div>
    )
  }

  const handleAdd = () => {
    const created = createManifestEntry(project.manifest)
    updateProject((p) => addManifestEntry(p, created))
    setSelectedName(created.name)
  }

  const handleScreenshot = (file: Blob) => {
    if (!entry) return
    const assetId = crypto.randomUUID()
    setAsset(`assets/${assetId}.png`, file)
    updateProject((p) => updateManifestEntry(p, entry.name, { screenshotAssetId: assetId }))
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <ManifestEntryList manifest={manifest} selectedName={entry?.name ?? null} onSelect={setSelectedName} onAdd={handleAdd} />
      <main className="flex-1 overflow-y-auto bg-background">
        {entry ? (
          <ManifestEntryForm
            entry={entry}
            screenshotUrl={screenshotUrl}
            onChange={(patch) => {
              updateProject((p) => updateManifestEntry(p, entry.name, patch))
              if (patch.name && patch.name.trim() && !manifest.some((m) => m.name === patch.name!.trim())) {
                setSelectedName(patch.name.trim())
              }
            }}
            onScreenshot={handleScreenshot}
            onRemoveScreenshot={() => updateProject((p) => updateManifestEntry(p, entry.name, { screenshotAssetId: null }))}
            onDelete={() => {
              updateProject((p) => removeManifestEntry(p, entry.name))
              setSelectedName(null)
            }}
          />
        ) : (
          <p className="p-6 text-sm text-muted-foreground">No components in the manifest. Add one to get started.</p>
        )}
      </main>
    </div>
  )
}
