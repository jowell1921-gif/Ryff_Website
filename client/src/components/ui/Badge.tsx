import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'purple' | 'green' | 'red' | 'outline'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-[var(--color-surface-3)] text-[var(--color-text-muted)]': variant === 'default',
          'bg-purple-600/20 text-purple-300 border border-purple-600/30': variant === 'purple',
          'bg-green-500/20 text-green-400 border border-green-500/30': variant === 'green',
          'bg-red-500/20 text-red-400 border border-red-500/30': variant === 'red',
          'border border-[var(--color-border)] text-[var(--color-text-muted)]': variant === 'outline',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
