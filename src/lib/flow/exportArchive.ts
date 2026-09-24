import JSZip from 'jszip'
import type { Project } from '@/types/project'
import { buildMarkdownReport } from '@/lib/flow/markdown'

// Every image reference in the exported markdown is a relative assets/ path
// (never embedded), so the .md files are useless on their own — this ships
// them in a zip alongside the actual screenshot files they point at.
export async function buildExportArchive(project: Project, assets: Map<string, Blob>): Promise<Blob> {
  const zip = new JSZip()
  zip.file('component-inspector-fdr-full.md', buildMarkdownReport(project, true))
  zip.file('component-inspector-fdr-no-thumbnails.md', buildMarkdownReport(project, false))

  for (const view of project.views) {
    if (!view.screenshotAssetId) continue
    const path = `assets/${view.screenshotAssetId}.png`
    const blob = assets.get(path)
    if (blob) zip.file(path, blob)
  }

  return zip.generateAsync({ type: 'blob' })
}
