import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
        // Mirrors the PoC's .btn.accent (Inspect toggle) — outlined blue,
        // solid blue with dark text once active.
        accentOutline: 'border border-cat-undocumented/70 bg-transparent text-cat-undocumented hover:bg-cat-undocumented/10',
        accentActive: 'border border-cat-undocumented bg-cat-undocumented text-[#04121f] hover:bg-cat-undocumented/90',
        // Mirrors .btn.rec (Recording toggle) — outlined red, solid red once active.
        recOutline: 'border border-rec/70 bg-transparent text-rec hover:bg-rec/10',
        recActive: 'border border-rec bg-rec text-[#1a0505] hover:bg-rec/90',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  ),
)
Button.displayName = 'Button'

export { Button, buttonVariants }
