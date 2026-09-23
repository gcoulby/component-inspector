export function supportsFileSystemAccess(): boolean {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window
}

function fdrPickerOptions() {
  return {
    types: [
      {
        description: 'FDR Studio project',
        accept: { 'application/zip': ['.fdr'] as `.${string}`[] },
      },
    ],
  }
}

export interface OpenResult {
  file: File
  handle: FileSystemFileHandle | null
}

export async function openFdrFile(): Promise<OpenResult | null> {
  if (supportsFileSystemAccess()) {
    let handles: FileSystemFileHandle[]
    try {
      handles = await window.showOpenFilePicker(fdrPickerOptions())
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return null
      throw err
    }
    const handle = handles[0]
    const file = await handle.getFile()
    return { file, handle }
  }

  return openFdrFileViaInput()
}

function openFdrFileViaInput(): Promise<OpenResult | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.fdr'
    input.addEventListener(
      'change',
      () => {
        const file = input.files?.[0] ?? null
        resolve(file ? { file, handle: null } : null)
      },
      { once: true },
    )
    input.click()
  })
}

export async function saveFdrBlob(
  blob: Blob,
  suggestedName: string,
  existingHandle: FileSystemFileHandle | null,
): Promise<FileSystemFileHandle | null> {
  if (supportsFileSystemAccess()) {
    const handle = existingHandle ?? (await pickSaveHandle(suggestedName))
    if (!handle) return null
    const writable = await handle.createWritable()
    await writable.write(blob)
    await writable.close()
    return handle
  }

  downloadBlob(blob, suggestedName)
  return null
}

async function pickSaveHandle(suggestedName: string): Promise<FileSystemFileHandle | null> {
  try {
    return await window.showSaveFilePicker({
      suggestedName,
      ...fdrPickerOptions(),
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return null
    throw err
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
