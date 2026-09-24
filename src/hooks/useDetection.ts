import { useCallback } from 'react'
import { useProjectStore } from '@/store/projectStore'
import type { Block, ComponentCategory, Project, RectPct } from '@/types/project'
import { autoLabel, rectPctOfLive, signatureOf } from '@/lib/detection/dom'
import { matchManifest } from '@/lib/detection/manifestMatch'
import {
  addManualBlock,
  getOrCreateComponent,
  removeBlockFromView,
  renameComponent,
  setBlockRect,
  setComponentCategory,
  setComponentColor,
  setComponentMatch,
  setComponentNotes,
  setComponentRefUrl,
} from '@/lib/detection/componentRegistry'

function addOrSelectBlock(project: Project, viewId: string, node: Element, frame: DOMRect): { project: Project; componentId: string } | null {
  const view = project.views.find((v) => v.id === viewId)
  if (!view) return null

  const signature = signatureOf(node)
  const existingBlock = view.blocks.find((b) => b.signature === signature)
  if (existingBlock) {
    return { project, componentId: existingBlock.componentId }
  }

  const match = matchManifest(node, project.manifest)
  const { components, component } = getOrCreateComponent(
    project.components,
    autoLabel(node),
    match ? 'matched' : 'unmatched',
    match ? match.name : null,
  )

  const block: Block = {
    id: crypto.randomUUID(),
    componentId: component.id,
    signature,
    tag: node.tagName.toLowerCase(),
    rectPct: rectPctOfLive(node, frame),
  }

  const views = project.views.map((v) => (v.id === viewId ? { ...v, blocks: [...v.blocks, block] } : v))

  return { project: { ...project, components, views }, componentId: component.id }
}

function autoDetectBlocks(
  project: Project,
  viewId: string,
  elements: Element[],
  frame: DOMRect,
): { project: Project; addedCount: number } | null {
  const startingView = project.views.find((v) => v.id === viewId)
  if (!startingView) return null
  const startingCount = startingView.blocks.length

  let current = project
  for (const el of elements) {
    const result = addOrSelectBlock(current, viewId, el, frame)
    if (!result) return null
    current = result.project
  }

  const endingCount = current.views.find((v) => v.id === viewId)?.blocks.length ?? startingCount
  return { project: current, addedCount: endingCount - startingCount }
}

// The only place, alongside useProject, that touches the project store
// directly — components get this via callbacks, never the store itself.
export function useDetection() {
  const updateProject = useProjectStore((s) => s.updateProject)

  const addOrSelectBlockAt = useCallback(
    (viewId: string, node: Element, frame: DOMRect): string | null => {
      let selectedComponentId: string | null = null
      updateProject((project) => {
        const result = addOrSelectBlock(project, viewId, node, frame)
        if (!result) return project
        selectedComponentId = result.componentId
        return result.project
      })
      return selectedComponentId
    },
    [updateProject],
  )

  const autoDetectAt = useCallback(
    (viewId: string, elements: Element[], frame: DOMRect): number => {
      let addedCount = 0
      updateProject((project) => {
        const result = autoDetectBlocks(project, viewId, elements, frame)
        if (!result) return project
        addedCount = result.addedCount
        return result.project
      })
      return addedCount
    },
    [updateProject],
  )

  const renameComponentAt = useCallback(
    (componentId: string, label: string) => updateProject((project) => renameComponent(project, componentId, label)),
    [updateProject],
  )

  const setComponentCategoryAt = useCallback(
    (componentId: string, category: ComponentCategory) =>
      updateProject((project) => setComponentCategory(project, componentId, category)),
    [updateProject],
  )

  const setComponentMatchAt = useCallback(
    (componentId: string, matchedName: string | null) =>
      updateProject((project) => setComponentMatch(project, componentId, matchedName)),
    [updateProject],
  )

  const setComponentNotesAt = useCallback(
    (componentId: string, notes: string) => updateProject((project) => setComponentNotes(project, componentId, notes)),
    [updateProject],
  )

  const setComponentRefUrlAt = useCallback(
    (componentId: string, refUrl: string) => updateProject((project) => setComponentRefUrl(project, componentId, refUrl)),
    [updateProject],
  )

  const removeBlockFromViewAt = useCallback(
    (viewId: string, componentId: string) => updateProject((project) => removeBlockFromView(project, viewId, componentId)),
    [updateProject],
  )

  const setComponentColorAt = useCallback(
    (componentId: string, color: string) => updateProject((project) => setComponentColor(project, componentId, color)),
    [updateProject],
  )

  const setBlockRectAt = useCallback(
    (viewId: string, blockId: string, rectPct: RectPct) =>
      updateProject((project) => setBlockRect(project, viewId, blockId, rectPct)),
    [updateProject],
  )

  const addManualBlockAt = useCallback(
    (viewId: string, rectPct: RectPct): string | null => {
      let selectedComponentId: string | null = null
      updateProject((project) => {
        const result = addManualBlock(project, viewId, rectPct)
        if (!result) return project
        selectedComponentId = result.componentId
        return result.project
      })
      return selectedComponentId
    },
    [updateProject],
  )

  return {
    addOrSelectBlockAt,
    autoDetectAt,
    renameComponentAt,
    setComponentCategoryAt,
    setComponentMatchAt,
    setComponentNotesAt,
    setComponentRefUrlAt,
    removeBlockFromViewAt,
    setComponentColorAt,
    setBlockRectAt,
    addManualBlockAt,
  }
}
