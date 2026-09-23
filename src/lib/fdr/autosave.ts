import type { Project } from '@/types/project'

const DB_NAME = 'fdr-studio-autosave'
const STORE_NAME = 'snapshots'
const SNAPSHOT_KEY = 'current'

export interface AutosaveSnapshot {
  project: Project
  assets: Map<string, Blob>
  savedAt: string
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function writeAutosaveSnapshot(project: Project, assets: Map<string, Blob>): Promise<void> {
  const db = await openDb()
  const snapshot: AutosaveSnapshot = { project, assets, savedAt: new Date().toISOString() }
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(snapshot, SNAPSHOT_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export async function readAutosaveSnapshot(): Promise<AutosaveSnapshot | null> {
  const db = await openDb()
  const snapshot = await new Promise<AutosaveSnapshot | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(SNAPSHOT_KEY)
    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () => reject(request.error)
  })
  db.close()
  return snapshot
}

export async function clearAutosaveSnapshot(): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(SNAPSHOT_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}
