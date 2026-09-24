export type ComponentCategory = 'new' | 'undocumented' | 'matched' | 'unmatched'

export type DetectionCategory = 'button' | 'nav' | 'field' | 'table' | 'badge' | 'other'

// One entry per distinct UI component, shared across every view it appears in.
// Renaming a component to a name that already exists merges the two.
export interface ProjectComponent {
  id: string
  label: string
  category: ComponentCategory
  matchedName: string | null
  notes: string
  refUrl: string
  // Box border/tag color — auto-assigned per distinct component so every
  // instance of the same component reads as one color across every view.
  // Never derived from `category`; that's what the status icon is for.
  color: string
}

export type RectPct = { left: number; top: number; width: number; height: number }

// A single boxed instance of a component on one view.
export interface Block {
  id: string
  componentId: string
  signature: string
  tag: string
  rectPct: RectPct
}

export interface View {
  id: string
  name: string
  details: string
  htmlAssetId: string
  screenshotAssetId: string | null
  blocks: Block[]
}

export interface ManifestEntry {
  name: string
  keywords: string[]
}

export interface FlowEdge {
  from: string
  to: string
  label: string
}

export interface Project {
  formatVersion: number
  name: string
  views: View[]
  components: ProjectComponent[]
  manifest: ManifestEntry[]
  flowText: string
}

export const CURRENT_FORMAT_VERSION = 1

export function createEmptyProject(name: string, defaultManifest: ManifestEntry[] = []): Project {
  return {
    formatVersion: CURRENT_FORMAT_VERSION,
    name,
    views: [],
    components: [],
    manifest: defaultManifest,
    flowText: '',
  }
}
