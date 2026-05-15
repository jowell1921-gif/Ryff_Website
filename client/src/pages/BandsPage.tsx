import { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { useBands } from '@/features/bands/hooks/useBands'
import { BandCard } from '@/features/bands/components/BandCard'
import { CreateBandModal } from '@/features/bands/components/CreateBandModal'
import { useDebounce } from '@/hooks/useDebounce'

const GENRE_FILTERS = [
  'Rock', 'Metal', 'Jazz', 'Pop', 'Clásica', 'Flamenco', 'Blues',
  'Reggae', 'Funk', 'Electrónica', 'Hip-Hop', 'Folk',
]

export function BandsPage() {
  const [search, setSearch] = useState('')
  const [activeGenre, setActiveGenre] = useState<string | undefined>()
  const [showCreate, setShowCreate] = useState(false)

  const debouncedSearch = useDebounce(search, 350)
  const { data: bands = [], isLoading } = useBands(debouncedSearch, activeGenre)

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* Cabecera */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text)]">Bandas</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Descubre grupos o crea el tuyo
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Crear banda
        </button>
      </div>

      {/* Buscador */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar bandas..."
          className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Filtros de género */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setActiveGenre(undefined)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !activeGenre
              ? 'bg-purple-600 text-white'
              : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:text-[var(--color-text)]'
          }`}
        >
          Todos
        </button>
        {GENRE_FILTERS.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGenre(activeGenre === g ? undefined : g)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeGenre === g
                ? 'bg-purple-600 text-white'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:text-[var(--color-text)]'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Resultados */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-[var(--color-surface-2)] animate-pulse" />
          ))}
        </div>
      ) : bands.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[var(--color-text-muted)] text-sm">
            {search || activeGenre ? 'No hay bandas con ese criterio.' : 'Aún no hay bandas. ¡Sé el primero!'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">
            {bands.length} {bands.length === 1 ? 'banda' : 'bandas'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {bands.map((band) => (
              <BandCard key={band.id} band={band} />
            ))}
          </div>
        </>
      )}

      {showCreate && <CreateBandModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
