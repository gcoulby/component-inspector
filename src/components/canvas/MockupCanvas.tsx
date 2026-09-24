import { cn } from '@/lib/utils'
import type { ProjectComponent, View } from '@/types/project'
import { CATEGORY_STYLES } from '@/data/categoryPresentation'
import { useLiveSessionStore } from '@/store/liveSessionStore'

const FRAME_WIDTH = 1280

interface MockupCanvasProps {
  view: View
  screenshotUrl: string | null
  components: ProjectComponent[]
  selectedComponentId: string | null
  onSelectComponent: (componentId: string) => void
}

// A saved view is a frozen screenshot, not a live re-render — matching the
// PoC, where the only place a mockup ever runs live is the Interactive tab.
// Boxes here are read-only markers over that screenshot: click one to select
// it in the inspector, but boxing/detecting only happens while live.
export function MockupCanvas({ view, screenshotUrl, components, selectedComponentId, onSelectComponent }: MockupCanvasProps) {
  const showBoxes = useLiveSessionStore((s) => s.showBoxes)

  return (
    <main className="flex flex-1 flex-col overflow-auto bg-[image:linear-gradient(hsl(var(--border))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border))_1px,transparent_1px)] bg-[size:24px_24px] bg-background">
      <div className="flex justify-center p-8">
        <div
          className="relative shrink-0 overflow-hidden rounded bg-black shadow-[0_0_0_1px_hsl(var(--border)),0_24px_60px_rgba(0,0,0,0.5)]"
          style={{ width: FRAME_WIDTH }}
        >
          {screenshotUrl ? (
            <img src={screenshotUrl} alt={view.name} className="block w-full" />
          ) : (
            <div className="p-16 text-center text-sm text-muted-foreground">
              No screenshot captured yet for this view.
            </div>
          )}
          <div className="pointer-events-none absolute inset-0">
            {showBoxes &&
              view.blocks.map((block) => {
                const component = components.find((c) => c.id === block.componentId)
                const style = CATEGORY_STYLES[component?.category ?? 'unmatched']
                return (
                  <div
                    key={block.id}
                    onClick={() => onSelectComponent(block.componentId)}
                    className={cn(
                      'pointer-events-auto absolute cursor-pointer rounded-sm border-2',
                      style.border,
                      style.bg,
                      block.componentId === selectedComponentId && 'ring-2 ring-white',
                    )}
                    style={{
                      left: `${block.rectPct.left}%`,
                      top: `${block.rectPct.top}%`,
                      width: `${block.rectPct.width}%`,
                      height: `${block.rectPct.height}%`,
                    }}
                  >
                    <span
                      className={cn(
                        'pointer-events-none absolute -top-[19px] left-[-2px] whitespace-nowrap rounded-t px-1.5 py-0.5 font-mono text-[10px] font-semibold',
                        style.tag,
                      )}
                    >
                      {component?.label ?? block.tag}
                    </span>
                  </div>
                )
              })}
          </div>
        </div>
      </div>
    </main>
  )
}
