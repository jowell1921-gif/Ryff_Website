import { type ButtonHTMLAttributes, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const sizeStyles: Record<'sm' | 'md' | 'lg', CSSProperties> = {
  sm: { padding: '6px 14px', fontSize: 12 },
  md: { padding: '8px 18px', fontSize: 13 },
  lg: { padding: '10px 22px', fontSize: 13 },
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      style={{ ...sizeStyles[size], ...style }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-purple-600 text-white hover:bg-purple-700 active:scale-95': variant === 'primary',
          'bg-[var(--color-surface-2)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)]': variant === 'secondary',
          'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]': variant === 'ghost',
          'bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30': variant === 'danger',
        },
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  )
}
