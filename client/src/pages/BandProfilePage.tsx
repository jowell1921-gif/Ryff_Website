import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Users, Crown } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useBand, useJoinBand, useLeaveBand, useIsMember } from '@/features/bands/hooks/useBands'
import { useAuthStore } from '@/stores/authStore'

export function BandProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentUserId = useAuthStore((s) => s.user?.id)

  const { data: band, isLoading } = useBand(id!)
  const { isMember, isAdmin } = useIsMember(band, currentUserId)
  const joinBand = useJoinBand(id!)
  const leaveBand = useLeaveBand(id!)

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="h-48 rounded-2xl bg-[var(--color-surface-2)] animate-pulse mb-4" />
        <div className="h-6 w-48 rounded bg-[var(--color-surface-2)] animate-pulse" />
      </div>
    )
  }

  if (!band) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 text-center">
        <p className="text-[var(--color-text-muted)]">Banda no encontrada.</p>
      </div>
    )
  }

  const admins = band.members.filter((m) => m.role === 'ADMIN')
  const regularMembers = band.members.filter((m) => m.role === 'MEMBER')

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">

      {/* Volver */}
      <button
        onClick={() => navigate('/bands')}
        className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        Volver a bandas
      </button>

      {/* Banner */}
      <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/60 to-indigo-900/60 mb-4">
        {band.banner && (
          <img src={band.banner} alt="" className="w-full h-full object-cover" />
        )}

        {/* Avatar */}
        <div className="absolute -bottom-6 left-6">
          <div className="w-16 h-16 rounded-2xl border-4 border-[var(--color-surface)] bg-purple-700 flex items-center justify-center overflow-hidden shadow-xl">
            {band.avatar ? (
              <img src={band.avatar} alt={band.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-white">
                {band.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info principal */}
      <div className="pt-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{band.name}</h1>
          {band.location && (
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin size={13} className="text-[var(--color-text-muted)]" />
              <span className="text-sm text-[var(--color-text-muted)]">{band.location}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 mt-1">
            <Users size={13} className="text-[var(--color-text-muted)]" />
            <span className="text-sm text-[var(--color-text-muted)]">
              {band._count.members} {band._count.members === 1 ? 'miembro' : 'miembros'}
            </span>
          </div>
        </div>

        {/* Botón unirse / salir */}
        {!isAdmin && (
          isMember ? (
            <button
              onClick={() => leaveBand.mutate()}
              disabled={leaveBand.isPending}
              className="px-5 py-2 rounded-xl text-sm font-medium border border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-red-500/50 hover:text-red-400 transition-colors disabled:opacity-50"
            >
              {leaveBand.isPending ? 'Saliendo...' : 'Salir de la banda'}
            </button>
          ) : (
            <button
              onClick={() => joinBand.mutate()}
              disabled={joinBand.isPending}
              className="px-5 py-2 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50"
            >
              {joinBand.isPending ? 'Uniéndose...' : 'Unirse'}
            </button>
          )
        )}
        {isAdmin && (
          <span className="px-4 py-2 rounded-xl text-xs font-medium bg-purple-600/20 text-purple-300 border border-purple-500/30">
            Admin
          </span>
        )}
      </div>

      {/* Géneros */}
      {band.genres.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {band.genres.map((g) => (
            <span
              key={g}
              className="px-3 py-1 rounded-full bg-purple-600/15 text-purple-300 text-xs font-medium"
            >
              {g}
            </span>
          ))}
        </div>
      )}

      {/* Descripción */}
      {band.description && (
        <p className="text-sm text-[var(--color-text-muted)] mt-4 leading-relaxed">
          {band.description}
        </p>
      )}

      {/* Buscamos */}
      {band.lookingFor.length > 0 && (
        <div className="mt-5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-2">
            Buscamos
          </p>
          <div className="flex flex-wrap gap-2">
            {band.lookingFor.map((instrument) => (
              <span
                key={instrument}
                className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-medium"
              >
                {instrument}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Miembros */}
      <div className="mt-8">
        <h2 className="text-sm font-bold text-[var(--color-text)] mb-3">Miembros</h2>

        {admins.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Admins</p>
            <div className="flex flex-col gap-2">
              {admins.map((m) => (
                <MemberRow key={m.id} member={m} />
              ))}
            </div>
          </div>
        )}

        {regularMembers.length > 0 && (
          <div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Miembros</p>
            <div className="flex flex-col gap-2">
              {regularMembers.map((m) => (
                <MemberRow key={m.id} member={m} />
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

function MemberRow({ member }: { member: { id: string; role: string; instrument: string | null; user: { id: string; name: string; avatar: string | null } } }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/profile/${member.user.id}`)}
      className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-purple-500/30 cursor-pointer transition-colors"
    >
      <Avatar size="sm" src={member.user.avatar} alt={member.user.name} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text)] truncate">{member.user.name}</p>
        {member.instrument && (
          <p className="text-xs text-[var(--color-text-muted)] truncate">{member.instrument}</p>
        )}
      </div>
      {member.role === 'ADMIN' && (
        <Crown size={14} className="text-amber-400 shrink-0" />
      )}
    </div>
  )
}
