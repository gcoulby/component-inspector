import { useCallback, useEffect, useState } from 'react'
import { useProjectStore } from '@/store/projectStore'
import { createEmptyProject, type View } from '@/types/project'
import { buildFdrArchive, parseFdrArchive } from '@/lib/fdr/serialize'
import { openFdrFile, saveFdrBlob } from '@/lib/fdr/fileSystemAccess'
import { deriveViewName } from '@/lib/detection/viewNaming'
import {
  clearAutosaveSnapshot,
  readAutosaveSnapshot,
  writeAutosaveSnapshot,
  type AutosaveSnapshot,
} from '@/lib/fdr/autosave'

const AUTOSAVE_INTERVAL_MS = 20_000

// Only one mounted consumer should drive the autosave interval and the
// startup recovery check, no matter how many components call this hook.
let autosaveDriverStarted = false

export function useProject() {
  const project = useProjectStore((s) => s.project)
  const assets = useProjectStore((s) => s.assets)
  const fileHandle = useProjectStore((s) => s.fileHandle)
  const createdAt = useProjectStore((s) => s.createdAt)
  const isDirty = useProjectStore((s) => s.isDirty)
  const loadProject = useProjectStore((s) => s.loadProject)
  const updateProject = useProjectStore((s) => s.updateProject)
  const setAsset = useProjectStore((s) => s.setAsset)
  const markSaved = useProjectStore((s) => s.markSaved)

  const [recoverableSnapshot, setRecoverableSnapshot] = useState<AutosaveSnapshot | null>(null)

  useEffect(() => {
    if (autosaveDriverStarted) return
    autosaveDriverStarted = true

    readAutosaveSnapshot().then((snapshot) => {
      if (snapshot) setRecoverableSnapshot(snapshot)
    })

    const interval = setInterval(() => {
      const state = useProjectStore.getState()
      if (state.project && state.isDirty) {
        void writeAutosaveSnapshot(state.project, state.assets)
      }
    }, AUTOSAVE_INTERVAL_MS)

    return () => {
      clearInterval(interval)
      autosaveDriverStarted = false
    }
  }, [])

  const newProject = useCallback(
    (name: string) => {
      loadProject(createEmptyProject(name), new Map(), { handle: null, createdAt: new Date().toISOString() })
      void clearAutosaveSnapshot()
      setRecoverableSnapshot(null)
    },
    [loadProject],
  )

  const openProject = useCallback(async () => {
    const result = await openFdrFile()
    if (!result) return
    const { archiveManifest, project: loaded, assets: loadedAssets } = await parseFdrArchive(result.file)
    loadProject(loaded, loadedAssets, { handle: result.handle, createdAt: archiveManifest.createdAt })
    void clearAutosaveSnapshot()
    setRecoverableSnapshot(null)
  }, [loadProject])

  const saveProject = useCallback(async () => {
    if (!project) return
    const blob = await buildFdrArchive(project, assets, createdAt)
    const handle = await saveFdrBlob(blob, `${project.name}.fdr`, fileHandle)
    if (fileHandle || handle) {
      markSaved(handle ?? fileHandle)
    } else {
      // Fallback download path: browser has no handle to report back, but the
      // file did download, so treat the project as saved.
      markSaved(null)
    }
    void clearAutosaveSnapshot()
  }, [project, assets, createdAt, fileHandle, markSaved])

  const addView = useCallback(
    (html: string): string => {
      const htmlAssetId = crypto.randomUUID()
      setAsset(`assets/${htmlAssetId}.html`, new Blob([html], { type: 'text/html' }))

      let newViewId = ''
      updateProject((p) => {
        const name = deriveViewName(
          html,
          p.views.map((v) => v.name),
          p.views.length + 1,
        )
        const view: View = { id: crypto.randomUUID(), name, htmlAssetId, screenshotAssetId: null, blocks: [] }
        newViewId = view.id
        return { ...p, views: [...p.views, view] }
      })
      return newViewId
    },
    [setAsset, updateProject],
  )

  const deleteView = useCallback(
    (viewId: string) => {
      updateProject((p) => ({ ...p, views: p.views.filter((v) => v.id !== viewId) }))
    },
    [updateProject],
  )

  const recoverSnapshot = useCallback(() => {
    if (!recoverableSnapshot) return
    loadProject(recoverableSnapshot.project, recoverableSnapshot.assets, {
      handle: null,
      createdAt: recoverableSnapshot.savedAt,
    })
    setRecoverableSnapshot(null)
  }, [recoverableSnapshot, loadProject])

  const discardSnapshot = useCallback(() => {
    void clearAutosaveSnapshot()
    setRecoverableSnapshot(null)
  }, [])

  return {
    project,
    assets,
    isDirty,
    hasFileHandle: fileHandle !== null,
    recoverableSnapshot,
    newProject,
    openProject,
    saveProject,
    updateProject,
    setAsset,
    addView,
    deleteView,
    recoverSnapshot,
    discardSnapshot,
  }
}
