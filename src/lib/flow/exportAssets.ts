import { addColoredBorder, cropScreenshot } from '@/lib/boxedImage'
import type { Project } from '@/types/project'

export interface ExportAssetPlan {
  // view id -> path of the boxed screenshot (falls back to raw if none stored)
  boxed: Map<string, string>
  raw: Map<string, string>
  // block id -> path of that box's cropped capture
  crops: Map<string, string>
  // component id -> path of its matched manifest screenshot, framed in the component's color
  refs: Map<string, string>
}

const cropPath = (blockId: string) => `assets/boxes/${blockId}.png`
const refPath = (componentId: string) => `assets/refs/${componentId}.png`

// Decides which image files an export will contain and where they live, so
// the markdown can reference them without anything having been rendered yet.
export function planExportAssets(project: Project, assets: Map<string, Blob>): ExportAssetPlan {
  const plan: ExportAssetPlan = { boxed: new Map(), raw: new Map(), crops: new Map(), refs: new Map() }

  for (const view of project.views) {
    if (view.screenshotAssetId) {
      plan.raw.set(view.id, `assets/${view.screenshotAssetId}.png`)
      for (const block of view.blocks) {
        if (block.rectPct.width > 0 && block.rectPct.height > 0) plan.crops.set(block.id, cropPath(block.id))
      }
    }
    if (view.boxedScreenshotAssetId) plan.boxed.set(view.id, `assets/${view.boxedScreenshotAssetId}.png`)
  }

  for (const component of project.components) {
    const entry = project.manifest.find((m) => m.name === component.matchedName)
    if (entry?.screenshotAssetId && assets.has(`assets/${entry.screenshotAssetId}.png`)) {
      plan.refs.set(component.id, refPath(component.id))
    }
  }
  return plan
}

// Produces the derived images (box crops, framed manifest references) the
// plan promises, straight from the raw captures — nothing here is stored in
// the .fdr, it's always regenerated from the current state.
export async function renderExportAssets(
  project: Project,
  assets: Map<string, Blob>,
  plan: ExportAssetPlan,
): Promise<Map<string, Blob>> {
  const out = new Map<string, Blob>()

  for (const view of project.views) {
    const raw = view.screenshotAssetId ? assets.get(`assets/${view.screenshotAssetId}.png`) : undefined
    if (!raw) continue
    for (const block of view.blocks) {
      if (!plan.crops.has(block.id)) continue
      const component = project.components.find((c) => c.id === block.componentId)
      const crop = await cropScreenshot(raw, block.rectPct)
      if (crop) out.set(cropPath(block.id), component ? await addColoredBorder(crop, component.color, 4) : crop)
    }
  }

  for (const component of project.components) {
    if (!plan.refs.has(component.id)) continue
    const entry = project.manifest.find((m) => m.name === component.matchedName)
    const source = entry?.screenshotAssetId ? assets.get(`assets/${entry.screenshotAssetId}.png`) : undefined
    if (source) out.set(refPath(component.id), await addColoredBorder(source, component.color))
  }
  return out
}
