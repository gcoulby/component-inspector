import { ViewsSidebar } from '@/components/canvas/ViewsSidebar'
import { MockupCanvas } from '@/components/canvas/MockupCanvas'
import { InspectorSidebar } from '@/components/canvas/InspectorSidebar'

export function CanvasPage() {
  return (
    <div className="flex flex-1 overflow-hidden">
      <ViewsSidebar />
      <MockupCanvas />
      <InspectorSidebar />
    </div>
  )
}
