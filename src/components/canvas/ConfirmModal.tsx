import { Button } from '@/components/ui/button'

interface ConfirmModalProps {
  open: boolean
  message: string
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmModal({ open, message, onCancel, onConfirm }: ConfirmModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div className="flex w-[420px] max-w-[90vw] flex-col gap-4 rounded-lg border border-border-strong bg-card p-5">
        <p className="text-sm text-foreground">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            No
          </Button>
          <Button variant="default" size="sm" onClick={onConfirm}>
            Yes
          </Button>
        </div>
      </div>
    </div>
  )
}
