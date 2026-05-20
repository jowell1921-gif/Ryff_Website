import { useNavigate } from 'react-router-dom'
import { Users, MapPin } from 'lucide-react'
import type { Band } from '@/types/band.types'

interface BandCardProps {
  band: Band
}

export function BandCard({ band }: BandCardProps) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/bands/${band.id}`)}
      className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl overflow-hidden cursor-pointer hover:border-purple-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-purple-900/10 group"
    >
      {/* Banner */}
      <div className="h-24 bg-gradient-to-br from-purple-900/50 to-indigo-900/50 relative">
        {band.banner && (
          <img src={band.banner} alt="" className="w-full h-full object-cover" />
        )}
        {/* Avatar sobre el banner */}
        <div className="absolute -bottom-5 left-4">
          <div className="w-12 h-12 rounded-xl border-2 border-[var(--color-surface-2)] bg-purple-700 flex items-center justify-center overflow-hidden">
            {band.avatar ? (
              <img src={band.avatar} alt={band.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-white">
                {band.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ paddingTop: 32, paddingLeft: 20, paddingRight: 20, paddingBottom: 20 }}>
        {/* Nombre y ubicación */}
        <h3 className="text-sm font-bold text-[var(--color-text)] group-hover:text-purple-300 transition-colors truncate">
          {band.name}
        </h3>
        {band.location && (
          <div className="flex items-center gap-1" style={{ marginTop: 4 }}>
            <MapPin size={11} className="text-[var(--color-text-muted)]" />
            <span className="text-xs text-[var(--color-text-muted)] truncate">{band.location}</span>
          </div>
        )}

        {/* Géneros */}
        {band.genres.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {band.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="rounded-full bg-purple-600 text-white border border-purple-500 font-semibold"
                style={{ padding: '5px 12px', fontSize: 12 }}
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Buscamos */}
        {band.lookingFor.length > 0 && (
          <p className="text-xs text-amber-400/80 truncate" style={{ marginTop: 8 }}>
            Buscamos: {band.lookingFor.join(', ')}
          </p>
        )}

        {/* Miembros */}
        <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]" style={{ marginTop: 12 }}>
          <Users size={12} />
          <span>{band._count.members} {band._count.members === 1 ? 'miembro' : 'miembros'}</span>
        </div>
      </div>
    </div>
  )
}
