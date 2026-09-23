// The zip-root manifest.json — archive-level metadata, not the ACL keyword
// manifest (that's Project.manifest, a ManifestEntry[]).
export interface ArchiveManifest {
  formatVersion: number
  name: string
  createdAt: string
  modifiedAt: string
}
