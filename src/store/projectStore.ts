import { create } from 'zustand'
import type { Project } from '@/types/project'

interface ProjectState {
  project: Project | null
  assets: Map<string, Blob>
  fileHandle: FileSystemFileHandle | null
  createdAt: string
  isDirty: boolean

  loadProject: (project: Project, assets: Map<string, Blob>, options: { handle: FileSystemFileHandle | null; createdAt: string }) => void
  updateProject: (updater: (project: Project) => Project) => void
  setAsset: (path: string, blob: Blob) => void
  markSaved: (handle: FileSystemFileHandle | null) => void
  closeProject: () => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  project: null,
  assets: new Map(),
  fileHandle: null,
  createdAt: new Date().toISOString(),
  isDirty: false,

  loadProject: (project, assets, { handle, createdAt }) =>
    set({ project, assets, fileHandle: handle, createdAt, isDirty: false }),

  updateProject: (updater) =>
    set((state) => {
      if (!state.project) return state
      return { project: updater(state.project), isDirty: true }
    }),

  setAsset: (path, blob) =>
    set((state) => {
      const assets = new Map(state.assets)
      assets.set(path, blob)
      return { assets, isDirty: true }
    }),

  markSaved: (handle) => set({ fileHandle: handle, isDirty: false }),

  closeProject: () =>
    set({ project: null, assets: new Map(), fileHandle: null, isDirty: false }),
}))
