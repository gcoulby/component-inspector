// For the live Mermaid preview only — Mermaid's own image handling drops
// blob: URLs (likely its sanitizer's allowlist), but keeps data: URIs. This
// is never persisted; the .fdr file and export still only ever store the
// Blob itself or a relative assets/ path.
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}
