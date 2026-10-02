import JSZip from 'jszip'
import type { Project } from '@/types/project'
import { buildMarkdownReport } from '@/lib/flow/markdown'
import { planExportAssets, renderExportAssets } from '@/lib/flow/exportAssets'

// Every image reference in the exported markdown is a relative assets/ path
// (never embedded), so the .md files are useless on their own — this ships
// them in a zip alongside the actual screenshot files they point at.
export async function buildExportArchive(project: Project, assets: Map<string, Blob>): Promise<Blob> {
  const zip = new JSZip()
  const plan = planExportAssets(project, assets)
  zip.file('component-inspector-fdr-full.md', buildMarkdownReport(project, true, plan))
  zip.file('component-inspector-fdr-no-thumbnails.md', buildMarkdownReport(project, false, plan))

  const stored = [...plan.raw.values(), ...plan.boxed.values()]
  for (const path of stored) {
    const blob = assets.get(path)
    if (blob) zip.file(path, blob)
  }
  const derived = await renderExportAssets(project, assets, plan)
  derived.forEach((blob, path) => zip.file(path, blob))

  return zip.generateAsync({ type: 'blob' })
}
