import { useState, useCallback, useRef, useEffect } from 'react'
import { Plus, Volume2, VolumeX, MessageCircle, Share2, X, Send, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useReels, useReactToReel, useReelComments, useAddReelComment, useDeleteReelComment } from '@/features/reels/hooks/useReels'
import { ReelPlayer } from '@/features/reels/components/ReelPlayer'
import { UploadReelModal } from '@/features/reels/components/UploadReelModal'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/stores/authStore'
import type { ReactionType } from '@/types/reel.types'

const REACTIONS: { type: ReactionType; emoji: string; activeColor: string }[] = [
  { type: 'APLAUSO', emoji: '👏', activeColor: '#c084fc' },
  { type: 'FIRE',    emoji: '🔥', activeColor: '#fb923c' },
  { type: 'ASOMBRA', emoji: '😮', activeColor: '#facc15' },
]

const MAX_COMMENT = 300
const REEL_HEIGHT = '92vh'
// Altura de BottomNav en mobile (h-14 = 56px) + margen
const MOBILE_NAV_H = 56

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return mobile
}

// ── Panel de comentarios ──────────────────────────────────────────────────────
function CommentPanel({
  reelId, onClose, isMobile,
}: { reelId: string; onClose: () => void; isMobile: boolean }) {
  const { data: comments = [], isLoading } = useReelComments(reelId)
  const addComment = useAddReelComment(reelId)
  const deleteComment = useDeleteReelComment(reelId)
  const { user } = useAuthStore()
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [comments.length])

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed || addComment.isPending) return
    addComment.mutate(trimmed, { onSuccess: () => setText('') })
  }

  const remaining = MAX_COMMENT - text.length
  const isOverLimit = remaining < 0

  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed', left: 0, right: 0,
        bottom: MOBILE_NAV_H, height: '65vh',
        borderRadius: '20px 20px 0 0',
        zIndex: 45,
      }
    : {
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 360,
        zIndex: 200,
      }

  return (
    <div style={{
      ...panelStyle,
      background: 'rgba(12,12,18,0.97)',
      backdropFilter: 'blur(24px)',
      borderLeft: isMobile ? 'none' : '1px solid rgba(255,255,255,0.07)',
      borderTop: isMobile ? '1px solid rgba(255,255,255,0.07)' : 'none',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>
          Comentarios{comments.length > 0 && <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}> ({comments.length})</span>}
        </span>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={16} color="white" />
        </button>
      </div>

      {/* Lista */}
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13, paddingTop: 40 }}>
            Sin comentarios aún. ¡Sé el primero!
          </p>
        ) : (
          comments.map((c) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 20px' }}>
              <Avatar size="xs" src={c.author.avatar} alt={c.author.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{c.author.name}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                    {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: es })}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5, wordBreak: 'break-word' }}>{c.content}</p>
              </div>
              {user?.id === c.author.id && (
                <button onClick={() => deleteComment.mutate(c.id)} style={{ flexShrink: 0, opacity: 0.4, transition: 'opacity 0.2s' }} className="hover:opacity-100">
                  <Trash2 size={13} color="#f87171" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '10px 14px', border: `1px solid ${isOverLimit ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() } }}
            placeholder="Escribe un comentario…"
            rows={2}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 13, lineHeight: 1.5, resize: 'none', fontFamily: 'inherit' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
            <span style={{ fontSize: 10, color: isOverLimit ? '#f87171' : 'rgba(255,255,255,0.3)' }}>{remaining}</span>
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || isOverLimit || addComment.isPending}
              style={{ width: 32, height: 32, borderRadius: '50%', background: text.trim() && !isOverLimit ? '#7c3aed' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            >
              <Send size={14} color={text.trim() && !isOverLimit ? 'white' : 'rgba(255,255,255,0.3)'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Botones de acción (reutilizados en desktop y mobile) ──────────────────────
function ActionButtons({
  activeReel, reactToReel, showComments, setShowComments, onShare, isMuted, setIsMuted, btnSize,
}: {
  activeReel: NonNullable<ReturnType<typeof useReels>['data']>[number]
  reactToReel: ReturnType<typeof useReactToReel>
  showComments: boolean
  setShowComments: (v: boolean | ((prev: boolean) => boolean)) => void
  onShare: () => void
  isMuted: boolean
  setIsMuted: (fn: (m: boolean) => boolean) => void
  btnSize: number
}) {
  const iconSize = btnSize === 50 ? 20 : 18

  return (
    <>
      {REACTIONS.map(({ type, emoji, activeColor }) => {
        const count = type === 'APLAUSO' ? activeReel.clapCount : type === 'FIRE' ? activeReel.fireCount : activeReel.asombraCount
        const active = type === 'APLAUSO' ? activeReel.isClapped : type === 'FIRE' ? activeReel.isFired : activeReel.isAsombra
        return (
          <button key={type} onClick={() => reactToReel.mutate({ reelId: activeReel.id, type })} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: active ? `${activeColor}30` : 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: `1px solid ${active ? activeColor + '60' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, transition: 'all 0.2s', transform: active ? 'scale(1.1)' : 'scale(1)' }}>
              {emoji}
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: active ? activeColor : 'rgba(255,255,255,0.65)' }}>{formatCount(count)}</span>
          </button>
        )
      })}

      <div style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.12)' }} />

      <button onClick={() => setShowComments((v) => !v)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: showComments ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: `1px solid ${showComments ? 'rgba(124,58,237,0.6)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
          <MessageCircle size={iconSize} color={showComments ? '#c084fc' : 'white'} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: showComments ? '#c084fc' : 'rgba(255,255,255,0.65)' }}>{formatCount(activeReel.commentCount)}</span>
      </button>

      <button onClick={onShare} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Share2 size={iconSize} color="white" />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>Compartir</span>
      </button>

      <div style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.12)' }} />

      <button onClick={() => setIsMuted((m) => !m)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ width: btnSize, height: btnSize, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isMuted ? <VolumeX size={iconSize} color="white" /> : <Volume2 size={iconSize} color="white" />}
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>{isMuted ? 'Silencio' : 'Sonido'}</span>
      </button>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function ReelsPage() {
  const { data: reels = [], isLoading } = useReels()
  const reactToReel = useReactToReel()
  const isMobile = useIsMobile()
  const [isMuted, setIsMuted] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [activeReelId, setActiveReelId] = useState<string | null>(null)

  const activeReel = reels.find((r) => r.id === activeReelId) ?? reels[0] ?? null

  const handleVisible = useCallback((reelId: string) => {
    setActiveReelId(reelId)
    setShowComments(false)
  }, [])

  const handleShare = async () => {
    if (!activeReel) return
    const shareData = { title: 'RYFF', text: activeReel.caption ?? 'Mira este reel en RYFF', url: window.location.href }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(shareData.url).catch(() => {})
    }
  }

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── MOBILE ────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {/* Video full-screen */}
        <div style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 10 }}>
          <div
            className="reel-scroll"
            style={{ width: '100%', height: '100%', overflowY: reels.length === 0 ? 'hidden' : 'scroll', scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}
          >
            {reels.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: '0 32px' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Aún no hay reels. ¡Sé el primero!</p>
                <button onClick={() => setShowUpload(true)} style={{ padding: '10px 22px', borderRadius: 999, background: '#7c3aed', color: 'white', fontSize: 14, fontWeight: 600 }}>Subir reel</button>
              </div>
            ) : (
              reels.map((reel) => (
                <ReelPlayer key={reel.id} reel={reel} isMuted={isMuted} onVisible={handleVisible} containerHeight="100vh" />
              ))
            )}
          </div>
        </div>

        {/* Botón + arriba a la derecha */}
        <button
          onClick={() => setShowUpload(true)}
          style={{ position: 'fixed', top: 16, right: 16, zIndex: 40, width: 40, height: 40, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(124,58,237,0.5)' }}
        >
          <Plus size={18} color="white" />
        </button>

        {/* Botones de acción — derecha, encima del BottomNav */}
        {activeReel && (
          <div style={{ position: 'fixed', right: 12, bottom: MOBILE_NAV_H + 20, zIndex: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <ActionButtons
              activeReel={activeReel}
              reactToReel={reactToReel}
              showComments={showComments}
              setShowComments={setShowComments}
              onShare={handleShare}
              isMuted={isMuted}
              setIsMuted={setIsMuted}
              btnSize={44}
            />
          </div>
        )}

        {showComments && activeReel && <CommentPanel reelId={activeReel.id} onClose={() => setShowComments(false)} isMobile />}
        {showUpload && <UploadReelModal onClose={() => setShowUpload(false)} />}
      </>
    )
  }

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  return (
    <div style={{ height: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

        {/* Izquierda: botón subir */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', height: REEL_HEIGHT, paddingTop: 40 }}>
          <button
            onClick={() => setShowUpload(true)}
            title="Subir reel"
            style={{ width: 44, height: 44, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(124,58,237,0.5)', transition: 'background 0.2s', flexShrink: 0 }}
            className="hover:bg-purple-500"
          >
            <Plus size={20} color="white" />
          </button>
        </div>

        {/* Video flotando */}
        <div style={{ width: 400, height: REEL_HEIGHT, borderRadius: 16, overflow: 'hidden', flexShrink: 0, boxShadow: '0 24px 80px rgba(0,0,0,0.9)', position: 'relative' }}>
          <div
            className="reel-scroll"
            style={{ width: '100%', height: '100%', overflowY: reels.length === 0 ? 'hidden' : 'scroll', scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}
          >
            {reels.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: '0 32px' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Aún no hay reels. ¡Sé el primero!</p>
                <button onClick={() => setShowUpload(true)} style={{ padding: '10px 22px', borderRadius: 999, background: '#7c3aed', color: 'white', fontSize: 14, fontWeight: 600 }}>Subir reel</button>
              </div>
            ) : (
              reels.map((reel) => (
                <ReelPlayer key={reel.id} reel={reel} isMuted={isMuted} onVisible={handleVisible} containerHeight={REEL_HEIGHT} />
              ))
            )}
          </div>
        </div>

        {/* Acciones derecha */}
        {activeReel && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <ActionButtons
              activeReel={activeReel}
              reactToReel={reactToReel}
              showComments={showComments}
              setShowComments={setShowComments}
              onShare={handleShare}
              isMuted={isMuted}
              setIsMuted={setIsMuted}
              btnSize={50}
            />
          </div>
        )}
      </div>

      {showComments && activeReel && <CommentPanel reelId={activeReel.id} onClose={() => setShowComments(false)} isMobile={false} />}
      {showUpload && <UploadReelModal onClose={() => setShowUpload(false)} />}
    </div>
  )
}
