import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Users, Crown, Music2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Avatar } from '@/components/ui/Avatar'
import { useBand, useJoinBand, useLeaveBand, useDeleteBand, useIsMember } from '@/features/bands/hooks/useBands'
import { useAuthStore } from '@/stores/authStore'

export function BandProfilePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const currentUserId = useAuthStore((s) => s.user?.id)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: band, isLoading } = useBand(id!)
  const { isMember, isAdmin } = useIsMember(band, currentUserId)
  const joinBand = useJoinBand(id!)
  const leaveBand = useLeaveBand(id!)
  const deleteBand = useDeleteBand()

  if (isLoading) {
    return (
      <div style={{ maxWidth: 672, margin: '0 auto', paddingLeft: 16, paddingRight: 16, paddingTop: 24, paddingBottom: 32 }}>
        <div className="rounded-2xl bg-[var(--color-surface-2)] animate-pulse" style={{ height: 192, marginBottom: 16 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <div className="rounded bg-[var(--color-surface-2)] animate-pulse" style={{ width: 160, height: 20 }} />
          <div className="rounded bg-[var(--color-surface-2)] animate-pulse" style={{ width: 120, height: 14 }} />
        </div>
      </div>
    )
  }

  if (!band) {
    return (
      <div style={{ maxWidth: 672, margin: '0 auto', padding: '48px 16px', textAlign: 'center' }}>
        <p className="text-[var(--color-text-muted)]">Banda no encontrada.</p>
      </div>
    )
  }

  const admins = band.members.filter((m) => m.role === 'ADMIN')
  const regularMembers = band.members.filter((m) => m.role === 'MEMBER')

  return (
    <div style={{ maxWidth: 672, margin: '0 auto', paddingLeft: 16, paddingRight: 16, paddingTop: 24, paddingBottom: 40 }}>

      {/* Volver */}
      <button
        onClick={() => navigate('/bands')}
        style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 14, fontWeight: 500 }}
        className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
      >
        <ArrowLeft size={16} />
        Volver a bandas
      </button>

      {/* ── Banner + Avatar centrado ── */}
      <div className="rounded-2xl shadow-2xl" style={{ position: 'relative' }}>

        {/* Banner */}
        <div
          className="rounded-t-2xl overflow-hidden"
          style={{ height: 192, background: 'linear-gradient(135deg, rgba(88,28,135,0.6), rgba(49,46,129,0.6))', position: 'relative' }}
        >
          {band.banner && (
            <img src={band.banner} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          {/* Decoración */}
          <div className="absolute -top-8 left-1/4 w-40 h-56 bg-purple-600/20 rounded-full blur-3xl rotate-12 pointer-events-none" />
          <div className="absolute -top-8 right-1/4 w-40 h-56 bg-indigo-600/15 rounded-full blur-3xl -rotate-12 pointer-events-none" />
        </div>

        {/* Avatar centrado sobre el borde del banner */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 'calc(192px - 44px)', zIndex: 10 }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ position: 'relative' }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-2xl bg-purple-500/40 blur-lg pointer-events-none"
            />
            <div
              className="bg-purple-700 border-4 border-[var(--color-surface-2)]"
              style={{ width: 88, height: 88, borderRadius: 20, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            >
              {band.avatar ? (
                <img src={band.avatar} alt={band.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 28, fontWeight: 800, color: 'white' }}>
                  {band.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Contenido centrado ── */}
        <div
          className="bg-[var(--color-surface-2)] rounded-b-2xl"
          style={{ paddingTop: 56, paddingBottom: 28, paddingLeft: 24, paddingRight: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}
        >
          {/* Nombre */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
          >
            <h1 className="text-[var(--color-text)]" style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>
              {band.name}
            </h1>
            {band.location && (
              <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }} className="text-purple-300/80">
                <MapPin size={12} />
                {band.location}
              </p>
            )}
            <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }} className="text-[var(--color-text-muted)]">
              <Users size={12} />
              {band._count.members} {band._count.members === 1 ? 'miembro' : 'miembros'}
            </p>
          </motion.div>

          {/* Botón acción */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.4, ease: 'easeOut' }}
          >
            {isAdmin ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  className="bg-purple-600/20 text-purple-300 border border-purple-500/30"
                  style={{ padding: '7px 20px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}
                >
                  Administrador
                </span>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                  style={{ padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, color: 'rgb(248,113,113)', display: 'flex', alignItems: 'center', gap: 6 }}
                  title="Eliminar banda"
                >
                  <Trash2 size={13} />
                  Eliminar
                </button>
              </div>
            ) : isMember ? (
              <button
                onClick={() => leaveBand.mutate()}
                disabled={leaveBand.isPending}
                style={{ padding: '8px 22px', borderRadius: 999, fontSize: 14, fontWeight: 600, border: '1px solid var(--color-border)', transition: 'all 0.2s' }}
                className="text-[var(--color-text-muted)] bg-[var(--color-surface)] hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
              >
                {leaveBand.isPending ? 'Saliendo...' : 'Salir de la banda'}
              </button>
            ) : (
              <button
                onClick={() => joinBand.mutate()}
                disabled={joinBand.isPending}
                style={{ padding: '8px 22px', borderRadius: 999, fontSize: 14, fontWeight: 700, border: '1px solid', transition: 'all 0.2s' }}
                className="bg-purple-600 text-white border-purple-500 hover:bg-purple-700 hover:scale-105 disabled:opacity-50"
              >
                {joinBand.isPending ? 'Uniéndose...' : 'Unirse'}
              </button>
            )}
          </motion.div>

          {/* Géneros */}
          {band.genres.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: 'easeOut' }}
              style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}
            >
              {band.genres.map((g) => (
                <span
                  key={g}
                  className="rounded-full bg-purple-600 text-white border border-purple-500 font-semibold"
                  style={{ padding: '5px 14px', fontSize: 12 }}
                >
                  {g}
                </span>
              ))}
            </motion.div>
          )}

          {/* Descripción */}
          {band.description && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26, duration: 0.4, ease: 'easeOut' }}
              className="text-[var(--color-text-muted)]"
              style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 480 }}
            >
              {band.description}
            </motion.p>
          )}
        </div>
      </div>

      {/* ── Buscamos ── */}
      {band.lookingFor.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.4, ease: 'easeOut' }}
          className="border border-amber-500/25 bg-amber-500/5"
          style={{ borderRadius: 18, marginTop: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }} className="text-amber-400">
            <Music2 size={13} />
            Buscamos
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {band.lookingFor.map((instrument) => (
              <span
                key={instrument}
                className="rounded-full border border-amber-500/40 bg-amber-500/10 font-semibold"
                style={{ padding: '5px 14px', fontSize: 12, color: 'rgb(252,211,77)' }}
              >
                {instrument}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Modal confirmar eliminar ── */}
      {showDeleteConfirm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-[var(--color-surface-2)] border border-[var(--color-border)]"
            style={{ borderRadius: 20, padding: '28px 28px 24px', maxWidth: 400, width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <h3 className="text-[var(--color-text)]" style={{ fontSize: 17, fontWeight: 700 }}>¿Eliminar la banda?</h3>
              <p className="text-[var(--color-text-muted)]" style={{ fontSize: 14, lineHeight: 1.5 }}>
                Esta acción es permanente. Se eliminará la banda <strong className="text-[var(--color-text)]">{band.name}</strong> y todos sus miembros perderán el acceso.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                style={{ padding: '9px 20px', borderRadius: 999, fontSize: 14, fontWeight: 600 }}
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteBand.mutate(id!)}
                disabled={deleteBand.isPending}
                className="bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
                style={{ padding: '9px 20px', borderRadius: 999, fontSize: 14, fontWeight: 700, color: 'white' }}
              >
                {deleteBand.isPending ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Miembros ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38, duration: 0.4, ease: 'easeOut' }}
        style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <h2 className="text-[var(--color-text)]" style={{ fontSize: 16, fontWeight: 700 }}>Miembros</h2>

        {admins.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p className="text-[var(--color-text-muted)]" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Admins
            </p>
            {admins.map((m) => <MemberRow key={m.id} member={m} />)}
          </div>
        )}

        {regularMembers.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {admins.length > 0 && (
              <p className="text-[var(--color-text-muted)]" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Miembros
              </p>
            )}
            {regularMembers.map((m) => <MemberRow key={m.id} member={m} />)}
          </div>
        )}
      </motion.div>

    </div>
  )
}

function MemberRow({ member }: {
  member: { id: string; role: string; instrument: string | null; user: { id: string; name: string; avatar: string | null } }
}) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/profile/${member.user.id}`)}
      className="bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-purple-500/30 cursor-pointer transition-colors"
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 14 }}
    >
      <Avatar size="sm" src={member.user.avatar} alt={member.user.name} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <p className="truncate text-[var(--color-text)]" style={{ fontSize: 14, fontWeight: 600 }}>
          {member.user.name}
        </p>
        {member.instrument && (
          <span
            className="rounded-full border border-purple-500/30 bg-purple-500/10 font-semibold"
            style={{ padding: '3px 10px', fontSize: 11, color: 'white', alignSelf: 'flex-start' }}
          >
            {member.instrument}
          </span>
        )}
      </div>
      {member.role === 'ADMIN' && (
        <Crown size={16} className="text-amber-400 shrink-0" />
      )}
    </div>
  )
}
