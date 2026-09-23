import type { ComponentCategory, Project, ProjectComponent } from '@/types/project'

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
