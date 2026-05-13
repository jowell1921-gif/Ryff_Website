import { useState } from 'react'
import { Search, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagSelectorProps {
  label: string
  placeholder: string
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  maxItems?: number
}

export function TagSelector({
  label,
  placeholder,
  options,
  selected,
  onChange,
  maxItems = 10,
}: TagSelectorProps) {
  const [query, setQuery] = useState('')

  const trimmed = query.trim()

  const filtered = trimmed
    ? options.filter((o) => o.toLowerCase().includes(trimmed.toLowerCase()))
    : []

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((s) => s !== item))
    } else if (selected.length < maxItems) {
      onChange([...selected, item])
      // Limpia el input al seleccionar para que el dropdown se cierre
      setQuery('')
    }
  }

  const remove = (item: string) => {
    onChange(selected.filter((s) => s !== item))
  }

  const showDropdown = trimmed.length > 0

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[var(--color-text-muted)]">{label}</label>
        {selected.length > 0 && (
          <span className="text-xs text-purple-400">
            {selected.length}/{maxItems} seleccionados
          </span>
        )}
      </div>

      {/* Tags seleccionados */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((item) => (
            <span
              key={item}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white border border-purple-500"
            >
              {item}
              <button
                type="button"
                onClick={() => remove(item)}
                className="hover:text-purple-200 transition-colors"
              >
                <X size={10} strokeWidth={3} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input de búsqueda */}
      <div className="relative">
        <Search
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          style={{ paddingLeft: '2rem' }}
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg py-2 pr-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Dropdown de resultados — solo cuando hay texto */}
      {showDropdown && (
        <div className="flex flex-wrap gap-1.5 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
          {filtered.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] w-full text-center py-1">
              Sin resultados para &quot;{trimmed}&quot;
            </p>
          ) : (
            filtered.map((item) => {
              const isSelected = selected.includes(item)
              const isMaxReached = !isSelected && selected.length >= maxItems
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggle(item)}
                  disabled={isMaxReached}
                  className={cn(
                    'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-all',
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-500'
                      : isMaxReached
                        ? 'opacity-40 cursor-not-allowed bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)]'
                        : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-purple-500/60 hover:text-purple-300 hover:bg-purple-500/10'
                  )}
                >
                  {isSelected && <Check size={9} strokeWidth={3} />}
                  {item}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
