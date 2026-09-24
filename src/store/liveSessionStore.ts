import { create } from 'zustand'

// The interactive workspace's loaded mockup and recording flag — deliberately
// separate from the project store: never written to the .fdr file, but kept
// alive for the whole app session so switching tabs and back doesn't make you
// re-paste the mockup, matching the PoC's global (non-persisted) session state.
interface LiveSessionState {
  rootHtml: string | null
  recording: boolean
  inspectMode: boolean
  showBoxes: boolean
  setRootHtml: (html: string | null) => void
  setRecording: (recording: boolean) => void
  setInspectMode: (inspectMode: boolean) => void
  setShowBoxes: (showBoxes: boolean) => void
}

export const useLiveSessionStore = create<LiveSessionState>((set) => ({
  rootHtml: null,
  recording: false,
  inspectMode: false,
  showBoxes: true,
  setRootHtml: (rootHtml) => set({ rootHtml }),
  setRecording: (recording) => set({ recording }),
  setInspectMode: (inspectMode) => set({ inspectMode }),
  setShowBoxes: (showBoxes) => set({ showBoxes }),
}))
