import { cn } from '@/lib/utils'
import { useToastStore } from '@/store/toastStore'

export function Toast() {
  const message = useToastStore((s) => s.message)

  return (
    <div
      className={cn(
        'pointer-events-none fixed bottom-5 left-1/2 z-50 max-w-[420px] -translate-x-1/2 rounded-lg border border-border-strong bg-accent px-4 py-2.5 text-center text-[12.5px] text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all duration-200',
        message ? 'opacity-100 -translate-y-1.5' : 'opacity-0',
      )}
    >
      {message}
    </div>
  )
}
