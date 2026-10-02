import type { ManifestEntry, Project } from '@/types/project'

export function createManifestEntry(existing: ManifestEntry[]): ManifestEntry {
  let name = 'new-component.tsx'
  let n = 2
  while (existing.some((m) => m.name === name)) {
    name = `new-component-${n}.tsx`
    n++
  }
  return { name, keywords: [], description: '', url: '', screenshotAssetId: null }
}

export function addManifestEntry(project: Project, entry: ManifestEntry): Project {
  return { ...project, manifest: [...project.manifest, entry] }
}

// Components matched to an entry are keyed by its name, so renaming the entry
// has to carry those components along or they silently lose their match.
export function updateManifestEntry(project: Project, name: string, patch: Partial<ManifestEntry>): Project {
  const newName = patch.name?.trim()
  const clash = newName && newName !== name && project.manifest.some((m) => m.name === newName)
  const safePatch = { ...patch, name: newName && !clash ? newName : name }
  return {
    ...project,
    manifest: project.manifest.map((m) => (m.name === name ? { ...m, ...safePatch } : m)),
    components:
      safePatch.name === name
        ? project.components
        : project.components.map((c) => (c.matchedName === name ? { ...c, matchedName: safePatch.name } : c)),
  }
}

export function removeManifestEntry(project: Project, name: string): Project {
  return {
    ...project,
    manifest: project.manifest.filter((m) => m.name !== name),
    components: project.components.map((c) => (c.matchedName === name ? { ...c, matchedName: null } : c)),
  }
}
