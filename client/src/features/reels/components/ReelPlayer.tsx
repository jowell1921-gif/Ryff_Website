import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import type { Reel } from '@/types/reel.types'

interface ReelPlayerProps {
  reel: Reel
  isMuted: boolean
  onVisible: (reelId: string) => void
  containerHeight?: string
}

export function ReelPlayer({ reel, isMuted, onVisible, containerHeight = '100vh' }: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {})
          setIsPlaying(true)
          onVisible(reel.id)
        } else {
          videoRef.current?.pause()
          setIsPlaying(false)
        }
      },
      { threshold: 0.7 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reel.id, onVisible])

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted
  }, [isMuted])

  const handleClick = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true) }
    else { videoRef.current.pause(); setIsPlaying(false) }
  }

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: containerHeight, flexShrink: 0, scrollSnapAlign: 'start', position: 'relative', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.thumbnailUrl ?? undefined}
        loop
        playsInline
        muted={isMuted}
        onClick={handleClick}
        style={{ height: '100%', width: '100%', objectFit: 'cover', cursor: 'pointer', display: 'block' }}
      />

      {/* Gradient inferior */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', pointerEvents: 'none' }} />

      {/* Info autor */}
      <div style={{ position: 'absolute', bottom: 28, left: 16, right: 16, pointerEvents: 'auto' }}>
        <button
          onClick={() => navigate(`/profile/${reel.author.id}`)}
          style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}
        >
          <Avatar size="sm" src={reel.author.avatar} alt={reel.author.name} />
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
            {reel.author.name}
          </span>
        </button>
        {reel.caption && (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 1.5, textShadow: '0 1px 3px rgba(0,0,0,0.6)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {reel.caption}
          </p>
        )}
      </div>

      {/* Pause indicator */}
      {!isPlaying && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={26} color="white" style={{ marginLeft: 4 }} />
          </div>
        </div>
      )}
    </div>
  )
}
