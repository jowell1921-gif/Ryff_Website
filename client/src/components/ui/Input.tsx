import { type InputHTMLAttributes, forwardRef, type ReactNode, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, className, id, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    const isPassword = type === 'password'
    // Si es contraseña, el tipo real alterna entre 'password' y 'text'
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type

    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-text-muted)]">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            style={{
              paddingLeft: leftIcon ? '2.25rem' : '0.75rem',
              // Deja espacio a la derecha para el botón del ojo
              paddingRight: isPassword ? '2.5rem' : '0.75rem',
            }}
            className={cn(
              'w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-lg py-2.5 text-sm text-[var(--color-text)] outline-none transition-all duration-200',
              // El placeholder desaparece al enfocar el campo
              'placeholder:text-[var(--color-text-muted)] placeholder:transition-opacity focus:placeholder:opacity-0',
              'focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/30',
              className
            )}
            {...props}
          />

          {/* Botón del ojo — solo aparece en campos de contraseña */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
