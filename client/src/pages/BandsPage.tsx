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
    <div style={{ maxWidth: 1024, margin: '0 auto', paddingLeft: 16, paddingRight: 16, paddingTop: 24, paddingBottom: 24 }}>

      {/* Cabecera */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="text-[var(--color-text)]" style={{ fontSize: 22, fontWeight: 800 }}>Bandas</h1>
          <p className="text-[var(--color-text-muted)]" style={{ fontSize: 14, marginTop: 4 }}>
            Descubre grupos o crea el tuyo
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          style={{ position: 'absolute', right: 0, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', borderRadius: 999, fontSize: 13, fontWeight: 700, border: '1px solid', transition: 'all 0.2s' }}
          className="bg-purple-600 text-white border-purple-500 hover:bg-purple-700 hover:scale-105"
        >
          <Plus size={15} />
          Crear banda
        </button>
      </div>

      {/* Buscador */}
      <div className="relative" style={{ marginBottom: 20 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar bandas..."
          className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-purple-500 transition-colors"
          style={{ paddingLeft: 16, paddingRight: 44, paddingTop: 14, paddingBottom: 14 }}
        />
        <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
      </div>

      {/* Filtros de género */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => setActiveGenre(undefined)}
          className={`rounded-full font-semibold transition-colors ${
            !activeGenre
              ? 'bg-purple-600 text-white border border-purple-500'
              : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:text-[var(--color-text)]'
          }`}
          style={{ padding: '5px 12px', fontSize: 12 }}
        >
          Todos
        </button>
        {GENRE_FILTERS.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGenre(activeGenre === g ? undefined : g)}
            className={`rounded-full font-semibold transition-colors ${
              activeGenre === g
                ? 'bg-purple-600 text-white border border-purple-500'
                : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)] hover:text-[var(--color-text)]'
            }`}
            style={{ padding: '5px 12px', fontSize: 12 }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Resultados */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(268px, 1fr))', gap: 16 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-[var(--color-surface-2)] animate-pulse" style={{ height: 210 }} />
          ))}
        </div>
      ) : bands.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: 80, paddingBottom: 80 }}>
          <p className="text-[var(--color-text-muted)]" style={{ fontSize: 14 }}>
            {search || activeGenre ? 'No hay bandas con ese criterio.' : 'Aún no hay bandas. ¡Sé el primero!'}
          </p>
        </div>
      ) : (
        <>
          <p className="text-[var(--color-text-muted)]" style={{ fontSize: 12, marginBottom: 12 }}>
            {bands.length} {bands.length === 1 ? 'banda' : 'bandas'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(268px, 1fr))', gap: 16 }}>
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
