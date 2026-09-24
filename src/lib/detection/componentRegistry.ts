import { pickComponentColor } from '@/data/componentColors'
import type { Block, ComponentCategory, Project, ProjectComponent, RectPct } from '@/types/project'

// Finds a component with this label (case-insensitive) to attach a new block
// to, or creates one with the next auto-assigned box color.
export function getOrCreateComponent(
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
    color: pickComponentColor(components),
  }
  return { components: [...components, component], component }
}

function uniqueComponentLabel(base: string, components: ProjectComponent[]): string {
  let label = base
  let n = 2
  while (components.some((c) => c.label.toLowerCase() === label.toLowerCase())) {
    label = `${base} (${n})`
    n++
  }
  return label
}

// Hand-drawn boxes have no live DOM element to inspect, so they build a
// Block directly from a drawn rectangle instead of going through
// signature/tag detection. Always a new component — a box drawn to cover
// something auto-detect missed is, by definition, not a duplicate of
// anything already boxed on this view.
export function addManualBlock(
  project: Project,
  viewId: string,
  rectPct: RectPct,
): { project: Project; componentId: string } | null {
  const view = project.views.find((v) => v.id === viewId)
  if (!view) return null

  const label = uniqueComponentLabel('New component', project.components)
  const component: ProjectComponent = {
    id: crypto.randomUUID(),
    label,
    category: 'unmatched',
    matchedName: null,
    notes: '',
    refUrl: '',
    color: pickComponentColor(project.components),
  }
  const block: Block = {
    id: crypto.randomUUID(),
    componentId: component.id,
    signature: `manual:${crypto.randomUUID()}`,
    tag: 'manual',
    rectPct,
  }

  return {
    project: {
      ...project,
      components: [...project.components, component],
      views: project.views.map((v) => (v.id === viewId ? { ...v, blocks: [...v.blocks, block] } : v)),
    },
    componentId: component.id,
  }
}

export function setBlockRect(project: Project, viewId: string, blockId: string, rectPct: RectPct): Project {
  return {
    ...project,
    views: project.views.map((v) =>
      v.id === viewId ? { ...v, blocks: v.blocks.map((b) => (b.id === blockId ? { ...b, rectPct } : b)) } : v,
    ),
  }
}

export function setComponentColor(project: Project, componentId: string, color: string): Project {
  return {
    ...project,
    components: project.components.map((c) => (c.id === componentId ? { ...c, color } : c)),
  }
}

// Renaming a component to a name that already exists merges the two: every
// block pointing at the old id is reattached to the survivor.
export function renameComponent(project: Project, componentId: string, rawLabel: string): Project {
  const label = rawLabel.trim()
  const comp = project.components.find((c) => c.id === componentId)
  if (!comp || !label || label === comp.label) return project

  const other = project.components.find(
    (c) => c.id !== componentId && c.label.toLowerCase() === label.toLowerCase(),
  )
  if (!other) {
    return {
      ...project,
      components: project.components.map((c) => (c.id === componentId ? { ...c, label } : c)),
    }
  }

  const merged: ProjectComponent = {
    ...other,
    notes: other.notes || comp.notes,
    refUrl: other.refUrl || comp.refUrl,
  }
  return {
    ...project,
    components: project.components
      .filter((c) => c.id !== componentId)
      .map((c) => (c.id === other.id ? merged : c)),
    views: project.views.map((v) => ({
      ...v,
      blocks: v.blocks.map((b) => (b.componentId === componentId ? { ...b, componentId: other.id } : b)),
    })),
  }
}

export function setComponentCategory(project: Project, componentId: string, category: ComponentCategory): Project {
  return {
    ...project,
    components: project.components.map((c) =>
      c.id === componentId ? { ...c, category, matchedName: category === 'matched' ? c.matchedName : null } : c,
    ),
  }
}

export function setComponentMatch(project: Project, componentId: string, matchedName: string | null): Project {
  return {
    ...project,
    components: project.components.map((c) => (c.id === componentId ? { ...c, matchedName } : c)),
  }
}

export function setComponentNotes(project: Project, componentId: string, notes: string): Project {
  return {
    ...project,
    components: project.components.map((c) => (c.id === componentId ? { ...c, notes } : c)),
  }
}

export function setComponentRefUrl(project: Project, componentId: string, refUrl: string): Project {
  return {
    ...project,
    components: project.components.map((c) => (c.id === componentId ? { ...c, refUrl } : c)),
  }
}

// Removes the block from just this view — the component stays in the
// registry for any other view it still appears in.
export function removeBlockFromView(project: Project, viewId: string, componentId: string): Project {
  return {
    ...project,
    views: project.views.map((v) =>
      v.id === viewId ? { ...v, blocks: v.blocks.filter((b) => b.componentId !== componentId) } : v,
    ),
  }
}
