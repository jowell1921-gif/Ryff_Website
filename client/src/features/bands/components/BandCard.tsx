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

      <div className="pt-7 px-4 pb-4">
        {/* Nombre y ubicación */}
        <h3 className="text-sm font-bold text-[var(--color-text)] group-hover:text-purple-300 transition-colors truncate">
          {band.name}
        </h3>
        {band.location && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={11} className="text-[var(--color-text-muted)]" />
            <span className="text-xs text-[var(--color-text-muted)] truncate">{band.location}</span>
          </div>
        )}

        {/* Géneros */}
        {band.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {band.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 rounded-full bg-purple-600/15 text-purple-300 text-[10px] font-medium"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Buscamos */}
        {band.lookingFor.length > 0 && (
          <p className="text-xs text-amber-400/80 mt-2 truncate">
            Buscamos: {band.lookingFor.join(', ')}
          </p>
        )}

        {/* Miembros */}
        <div className="flex items-center gap-1 mt-3 text-xs text-[var(--color-text-muted)]">
          <Users size={12} />
          <span>{band._count.members} {band._count.members === 1 ? 'miembro' : 'miembros'}</span>
        </div>
      </div>
    </div>
  )
}
