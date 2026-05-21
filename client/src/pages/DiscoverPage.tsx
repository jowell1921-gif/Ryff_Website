import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, X, Compass, Music2, Mic2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchUsers } from '@/features/profile/hooks/useProfile'
import { MusicianCard } from '@/features/profile/components/MusicianCard'
import { INSTRUMENTS, GENRES } from '@/features/profile/constants/musicData'

export function DiscoverPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [instrument, setInstrument] = useState<string | undefined>()
  const [genre, setGenre] = useState<string | undefined>()
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { data: musicians, isLoading } = useSearchUsers({ search, instrument, genre })

  const hasActiveFilter = !!instrument || !!genre
  const clearFilters = () => { setInstrument(undefined); setGenre(undefined) }

  return (
    <div style={{ maxWidth: 672, margin: '0 auto', paddingLeft: 16, paddingRight: 16, paddingBottom: 40 }}>

      {/* ── Header ── */}
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', marginBottom: 28, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="bg-purple-600/20 rounded-xl" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Compass size={18} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-[var(--color-text)]" style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>Descubrir</h1>
            <p className="text-[var(--color-text-muted)]" style={{ fontSize: 12 }}>Encuentra músicos por instrumento o género</p>
          </div>
        </div>
      </div>

      {/* ── Búsqueda + botón filtro (icono) ── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} className="absolute text-[var(--color-text-muted)] pointer-events-none" style={{ left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar músico por nombre..."
            className="w-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-purple-500 transition-colors"
            style={{ paddingTop: 18, paddingBottom: 18, paddingLeft: 42, paddingRight: 16, borderRadius: 14, fontSize: 14 }}
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} className="absolute text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors" style={{ right: 12, top: '50%', transform: 'translateY(-50%)' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Botón icono — abre/cierra el panel de filtros */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{ width: 52, borderRadius: 14, border: '1px solid', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}
          className={showFilters || hasActiveFilter
            ? 'bg-purple-600/20 text-purple-300 border-purple-500/50'
            : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-purple-500/40 hover:text-purple-300'
          }
        >
          <SlidersHorizontal size={16} />
          {hasActiveFilter && (
            <span className="absolute bg-purple-500 rounded-full" style={{ top: 8, right: 8, width: 6, height: 6 }} />
          )}
        </button>
      </div>

      {/* ── Filtros activos ── */}
      <AnimatePresence>
        {hasActiveFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap', overflow: 'hidden' }}
          >
            <span className="text-[var(--color-text-muted)]" style={{ fontSize: 12, fontWeight: 600 }}>Activos:</span>
            {instrument && (
              <span className="bg-purple-600 border border-purple-500 font-semibold" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, fontSize: 12, color: 'white' }}>
                <Music2 size={11} />
                {instrument}
                <button onClick={() => setInstrument(undefined)} style={{ display: 'flex', lineHeight: 1 }}><X size={10} strokeWidth={2.5} /></button>
              </span>
            )}
            {genre && (
              <span className="border border-purple-500/40 bg-purple-500/15 font-semibold" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 999, fontSize: 12, color: 'white' }}>
                <Mic2 size={11} />
                {genre}
                <button onClick={() => setGenre(undefined)} style={{ display: 'flex', lineHeight: 1 }}><X size={10} strokeWidth={2.5} /></button>
              </span>
            )}
            <button onClick={clearFilters} className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors" style={{ fontSize: 12, fontWeight: 600 }}>
              Limpiar todo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Panel de filtros ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden', marginBottom: 20 }}
          >
            <div className="bg-[var(--color-surface-2)] border border-[var(--color-border)]" style={{ borderRadius: 18 }}>

              {/* Cabecera del panel */}
              <div className="border-b border-[var(--color-border)]" style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p className="text-[var(--color-text)]" style={{ fontSize: 14, fontWeight: 700 }}>Filtros</p>
                <button onClick={() => setShowFilters(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 0 }}>

                {/* Instrumento */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p className="text-[var(--color-text-muted)]" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Instrumento</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {INSTRUMENTS.map((inst) => (
                      <button
                        key={inst}
                        onClick={() => setInstrument(instrument === inst ? undefined : inst)}
                        className={instrument === inst ? 'bg-purple-600 border-purple-500' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-purple-500/50 hover:text-purple-300 transition-all'}
                        style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, border: '1px solid', color: instrument === inst ? 'white' : undefined }}
                      >
                        {inst}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Separador */}
                <div className="border-t border-[var(--color-border)]" style={{ margin: '20px 0' }} />

                {/* Género */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <p className="text-[var(--color-text-muted)]" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Género</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {GENRES.map((g) => (
                      <button
                        key={g}
                        onClick={() => setGenre(genre === g ? undefined : g)}
                        className={genre === g ? 'bg-purple-600 border-purple-500' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-purple-500/50 hover:text-purple-300 transition-all'}
                        style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600, border: '1px solid', color: genre === g ? 'white' : undefined }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Separador + contador ── */}
      {!isLoading && musicians && musicians.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div className="border-t border-[var(--color-border)]" style={{ flex: 1 }} />
          <span className="text-[var(--color-text-muted)]" style={{ fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
            {musicians.length} músico{musicians.length !== 1 ? 's' : ''}
          </span>
          <div className="border-t border-[var(--color-border)]" style={{ flex: 1 }} />
        </div>
      )}

      {/* ── Resultados ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

        {isLoading && [...Array(5)].map((_, i) => (
          <div key={i} className="bg-[var(--color-surface-2)] border border-[var(--color-border)] animate-pulse" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 18 }}>
            <div className="rounded-full bg-[var(--color-surface-3)]" style={{ width: 52, height: 52, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="rounded bg-[var(--color-surface-3)]" style={{ width: 140, height: 13 }} />
              <div className="rounded bg-[var(--color-surface-3)]" style={{ width: 100, height: 10 }} />
              <div style={{ display: 'flex', gap: 6 }}>
                <div className="rounded-full bg-[var(--color-surface-3)]" style={{ width: 72, height: 22 }} />
                <div className="rounded-full bg-[var(--color-surface-3)]" style={{ width: 56, height: 22 }} />
              </div>
            </div>
          </div>
        ))}

        {!isLoading && musicians?.map((musician, index) => (
          <MusicianCard key={musician.id} musician={musician} index={index} />
        ))}

        {!isLoading && musicians?.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', paddingTop: 56, paddingBottom: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
          >
            <div className="bg-purple-600/10 rounded-2xl" style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Compass size={22} className="text-purple-400" />
            </div>
            <p className="text-[var(--color-text)]" style={{ fontSize: 15, fontWeight: 600 }}>Sin resultados</p>
            <p className="text-[var(--color-text-muted)]" style={{ fontSize: 14, maxWidth: 280 }}>
              {search || hasActiveFilter ? 'Intenta con otros filtros o un nombre diferente.' : 'Todavía no hay otros músicos registrados.'}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
