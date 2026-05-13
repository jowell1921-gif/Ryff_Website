import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2 } from 'lucide-react'

interface NominatimResult {
  place_id: number
  display_name: string
  address: {
    city?: string
    town?: string
    village?: string
    hamlet?: string
    state?: string
    country?: string
  }
}

function formatLocation(result: NominatimResult): string {
  const { address } = result
  const city = address.city ?? address.town ?? address.village ?? address.hamlet
  const parts = [city, address.country].filter(Boolean)
  return parts.join(', ')
}

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
}

export function LocationAutocomplete({ value, onChange }: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync value cuando el padre cambia (ej. al resetear el form)
  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (query.length < 2) { setSuggestions([]); setIsOpen(false); return }

    timerRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`
        const res = await fetch(url, { headers: { 'Accept-Language': 'es' } })
        const data: NominatimResult[] = await res.json()
        // Filtra duplicados por ciudad+país
        const seen = new Set<string>()
        const unique = data.filter((r) => {
          const key = formatLocation(r)
          if (seen.has(key) || !key) return false
          seen.add(key)
          return true
        })
        setSuggestions(unique)
        setIsOpen(unique.length > 0)
      } catch {
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 420)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query])

  // Cierra al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (result: NominatimResult) => {
    const formatted = formatLocation(result)
    setQuery(formatted)
    onChange(formatted)
    setIsOpen(false)
    setSuggestions([])
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-1.5 relative">
      <label className="text-sm font-medium text-[var(--color-text-muted)]">Ubicación</label>

      <div className="relative">
        <MapPin
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none"
        />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            onChange(e.target.value)
          }}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder="Ciudad, País"
          style={{ paddingLeft: '2rem' }}
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg py-2.5 pr-8 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-purple-500 transition-colors"
        />
        {isLoading && (
          <Loader2
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 animate-spin"
          />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl overflow-hidden z-50 shadow-2xl">
          {suggestions.map((s) => {
            const formatted = formatLocation(s)
            return (
              <button
                key={s.place_id}
                type="button"
                onClick={() => select(s)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-[var(--color-surface)] transition-colors group"
              >
                <MapPin size={12} className="text-purple-400 shrink-0" />
                <span className="text-[var(--color-text)] group-hover:text-purple-300 transition-colors">
                  {formatted}
                </span>
                {s.address.state && (
                  <span className="text-xs text-[var(--color-text-muted)] ml-auto shrink-0">
                    {s.address.state}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
