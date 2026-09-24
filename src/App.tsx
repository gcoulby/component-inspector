import { useRef, useState } from 'react'
import { ProjectToolbar } from '@/components/layout/ProjectToolbar'
import { RecoveryBanner } from '@/components/layout/RecoveryBanner'
import { Toast } from '@/components/layout/Toast'
import type { Mode } from '@/components/layout/ModeTabs'
import { CanvasPage } from '@/components/canvas/CanvasPage'
import { FlowPage } from '@/components/flow/FlowPage'
import { LIVE_VIEW_ID } from '@/lib/liveSession'
import type { InteractiveWorkspaceHandle } from '@/components/canvas/InteractiveWorkspace'

export function App() {
  const [mode, setMode] = useState<Mode>('canvas')
  const [activeViewId, setActiveViewId] = useState<string>(LIVE_VIEW_ID)
  const [modalOpen, setModalOpen] = useState(false)
  const workspaceRef = useRef<InteractiveWorkspaceHandle>(null)

  return (
    <div className="flex h-screen flex-col">
      <ProjectToolbar
        mode={mode}
        onModeChange={setMode}
        isInteractiveActive={mode === 'canvas' && activeViewId === LIVE_VIEW_ID}
        onLoadMockupClick={() => setModalOpen(true)}
        onAutoDetect={() => workspaceRef.current?.autoDetect()}
        onSaveView={() => workspaceRef.current?.saveView()}
      />
      <RecoveryBanner />
      {/* CanvasPage stays mounted even on the Flow tab, hidden with
          display:none rather than unmounted, so the live mockup's in-app
          state (scroll position, wizard step, recording) survives switching
          away and back — matching the PoC, which never tears the iframe
          down. Flow has no equivalent live state, and mounting its
          svg-pan-zoom canvas while display:none gives it a zero-size
          viewport to measure against, so it stays conditionally rendered. */}
      <div className={mode === 'canvas' ? 'flex flex-1 overflow-hidden' : 'hidden'}>
        <CanvasPage
          activeViewId={activeViewId}
          onActiveViewIdChange={setActiveViewId}
          modalOpen={modalOpen}
          onModalOpenChange={setModalOpen}
          workspaceRef={workspaceRef}
        />
      </div>
      {mode === 'flow' && (
        <div className="flex flex-1 overflow-hidden">
          <FlowPage />
        </div>
      )}
      <Toast />
    </div>
  )
}
