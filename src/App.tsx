import { useState } from 'react'
import { ProjectToolbar } from '@/components/layout/ProjectToolbar'
import { ModeTabs, type Mode } from '@/components/layout/ModeTabs'
import { CanvasPage } from '@/components/canvas/CanvasPage'
import { FlowPage } from '@/components/flow/FlowPage'

export function App() {
  const [mode, setMode] = useState<Mode>('canvas')

  return (
    <div className="flex h-screen flex-col">
      <ProjectToolbar />
      <div className="flex items-center border-b border-border bg-card px-3 py-1.5">
        <ModeTabs mode={mode} onModeChange={setMode} />
      </div>
      {mode === 'canvas' ? <CanvasPage /> : <FlowPage />}
    </div>
  )
}
