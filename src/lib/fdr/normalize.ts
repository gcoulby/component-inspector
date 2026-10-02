import { pickComponentColor } from '@/data/componentColors'
import type { Project, ProjectComponent } from '@/types/project'

// Fills in fields added after a project was first saved, so older .fdr files
// and autosave snapshots open without any undefined values downstream.
export function normalizeProject(project: Project): Project {
  const components: ProjectComponent[] = []
  for (const c of project.components) {
    components.push({ ...c, color: c.color ?? pickComponentColor(components) })
  }
  return {
    ...project,
    components,
    manifest: project.manifest.map((m) => ({
      ...m,
      description: m.description ?? '',
      url: m.url ?? '',
      screenshotAssetId: m.screenshotAssetId ?? null,
    })),
    views: project.views.map((v) => ({ ...v, details: v.details ?? '', boxedScreenshotAssetId: v.boxedScreenshotAssetId ?? null })),
  }
}
