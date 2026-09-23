import { useCallback } from 'react'
import { useProjectStore } from '@/store/projectStore'
import type { Block, ComponentCategory, Project, ProjectComponent } from '@/types/project'
import { autoLabel, rectPctOfLive, signatureOf } from '@/lib/detection/dom'
import { matchManifest } from '@/lib/detection/manifestMatch'

function getOrCreateComponent(
  components: ProjectComponent[],
  label: string,
  category: ComponentCategory,
  matchedName: string | null,
): { components: ProjectComponent[]; component: ProjectComponent } {
  const existing = components.find((c) => c.label.toLowerCase() === label.toLowerCase())
  if (existing) return { components, component: existing }

  const component: ProjectComponent = {
    id: crypto.randomUUID(),
    label,
    category,
    matchedName,
    notes: '',
    refUrl: '',
  }
  return { components: [...components, component], component }
}

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

  return { addOrSelectBlockAt }
}
