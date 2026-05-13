import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSearchUsers } from '@/features/profile/hooks/useProfile'
import { MusicianCard } from '@/features/profile/components/MusicianCard'

const INSTRUMENT_FILTERS = [
  'Guitarra Eléctrica',
  'Bajo Eléctrico',
  'Batería',
  'Piano',
  'Teclado',
  'Sintetizador',
  'Voz / Vocalista',
  'Violín',
  'Saxofón Alto',
  'Producción / DJ',
]

const GENRE_FILTERS = [
  'Rock',
  'Metal',
  'Jazz',
  'Pop',
  'Indie',
  'Electrónica',
  'Hip-Hop',
  'Blues',
  'Folk',
  'Clásica',
  'Shoegaze',
  'Post-Rock',
]

export function DiscoverPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [instrument, setInstrument] = useState<string | undefined>()
  const [genre, setGenre] = useState<string | undefined>()
  const [showFilters, setShowFilters] = useState(false)

  // Debounce: espera 400ms después de que el usuario deja de escribir
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: musicians, isLoading } = useSearchUsers({ search, instrument, genre })

  const hasActiveFilter = !!instrument || !!genre
  const clearFilters = () => { setInstrument(undefined); setGenre(undefined) }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-1"
      >
        <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight">
          Descubrir músicos
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">
          Encuentra artistas por instrumento, género o nombre
        </p>
      </motion.div>

      {/* Barra de búsqueda */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
          />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar músico por nombre..."
            style={{ paddingLeft: '2.25rem' }}
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl py-2.5 pr-4 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Botón de filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all
            ${showFilters || hasActiveFilter
              ? 'bg-purple-600/20 text-purple-300 border-purple-600/40'
              : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-purple-600/40'
            }`}
        >
          <SlidersHorizontal size={15} />
          {hasActiveFilter && (
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
          )}
        </button>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-4 p-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl"
        >
          {/* Instrumento */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">
              Instrumento
            </p>
            <div className="flex flex-wrap gap-1.5">
              {INSTRUMENT_FILTERS.map((inst) => (
                <button
                  key={inst}
                  onClick={() => setInstrument(instrument === inst ? undefined : inst)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all
                    ${instrument === inst
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-purple-500/50 hover:text-purple-300'
                    }`}
                >
                  {inst}
                </button>
              ))}
            </div>
          </div>

          {/* Género */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-widest">
              Género
            </p>
            <div className="flex flex-wrap gap-1.5">
              {GENRE_FILTERS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGenre(genre === g ? undefined : g)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all
                    ${genre === g
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-purple-500/50 hover:text-purple-300'
                    }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Limpiar filtros */}
          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors self-start"
            >
              <X size={12} />
              Limpiar filtros
            </button>
          )}
        </motion.div>
      )}

      {/* Resultados */}
      <div className="flex flex-col gap-3">
        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] animate-pulse"
              >
                <div className="w-14 h-14 rounded-full bg-[var(--color-surface-3,var(--color-surface))] shrink-0" />
                <div className="flex-1 flex flex-col gap-2 pt-1">
                  <div className="w-32 h-3.5 rounded bg-[var(--color-surface-3,var(--color-surface))]" />
                  <div className="w-24 h-2.5 rounded bg-[var(--color-surface-3,var(--color-surface))]" />
                  <div className="w-48 h-2.5 rounded bg-[var(--color-surface-3,var(--color-surface))]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lista de músicos */}
        {!isLoading && musicians && musicians.length > 0 && (
          <>
            <p className="text-xs text-[var(--color-text-muted)]">
              {musicians.length} músico{musicians.length !== 1 ? 's' : ''} encontrado{musicians.length !== 1 ? 's' : ''}
            </p>
            {musicians.map((musician, index) => (
              <MusicianCard key={musician.id} musician={musician} index={index} />
            ))}
          </>
        )}

        {/* Empty state */}
        {!isLoading && musicians?.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 flex flex-col items-center gap-3"
          >
            <div className="text-4xl">🎸</div>
            <p className="font-semibold text-[var(--color-text)]">Sin resultados</p>
            <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
              {search || hasActiveFilter
                ? 'Intenta con otros filtros o un nombre diferente.'
                : 'Todavía no hay otros músicos registrados.'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
