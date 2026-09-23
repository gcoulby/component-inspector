import JSZip from 'jszip'
import { CURRENT_FORMAT_VERSION, type Project } from '@/types/project'
import type { ArchiveManifest } from '@/types/archive'

export class FdrFormatError extends Error {}

export interface FdrArchive {
  archiveManifest: ArchiveManifest
  project: Project
  assets: Map<string, Blob>
}

export async function buildFdrArchive(
  project: Project,
  assets: Map<string, Blob>,
  createdAt: string,
): Promise<Blob> {
  const zip = new JSZip()
  const archiveManifest: ArchiveManifest = {
    formatVersion: CURRENT_FORMAT_VERSION,
    name: project.name,
    createdAt,
    modifiedAt: new Date().toISOString(),
  }
  zip.file('manifest.json', JSON.stringify(archiveManifest, null, 2))
  zip.file('project.json', JSON.stringify(project, null, 2))
  for (const [path, blob] of assets) {
    zip.file(path, blob)
  }
  return zip.generateAsync({ type: 'blob' })
}

export async function parseFdrArchive(source: Blob): Promise<FdrArchive> {
  const zip = await JSZip.loadAsync(source)

  const manifestFile = zip.file('manifest.json')
  const projectFile = zip.file('project.json')
  if (!manifestFile || !projectFile) {
    throw new FdrFormatError('Not a valid .fdr file: missing manifest.json or project.json.')
  }

  const archiveManifest = JSON.parse(await manifestFile.async('string')) as ArchiveManifest
  if (archiveManifest.formatVersion > CURRENT_FORMAT_VERSION) {
    throw new FdrFormatError(
      `This project was saved with a newer format (v${archiveManifest.formatVersion}) than this app supports (v${CURRENT_FORMAT_VERSION}).`,
    )
  }

  const project = JSON.parse(await projectFile.async('string')) as Project

  const assets = new Map<string, Blob>()
  const assetFiles = zip.folder('assets')
  if (assetFiles) {
    const entries: Promise<void>[] = []
    assetFiles.forEach((relativePath, file) => {
      if (file.dir) return
      entries.push(
        file.async('blob').then((blob) => {
          assets.set(`assets/${relativePath}`, blob)
        }),
      )
    })
    await Promise.all(entries)
  }

  return { archiveManifest, project, assets }
}
