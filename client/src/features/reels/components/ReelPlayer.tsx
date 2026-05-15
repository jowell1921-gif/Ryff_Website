import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, Volume2, VolumeX } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useToggleReelLike } from '../hooks/useReels'
import type { Reel } from '@/types/reel.types'

interface ReelPlayerProps {
  reel: Reel
  isMuted: boolean
  onMuteToggle: () => void
}

export function ReelPlayer({ reel, isMuted, onMuteToggle }: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const navigate = useNavigate()
  const toggleLike = useToggleReelLike()

  // Autoplay cuando el reel es visible en pantalla
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {})
          setIsPlaying(true)
        } else {
          videoRef.current?.pause()
          setIsPlaying(false)
        }
      },
      { threshold: 0.7 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleVideoClick = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen flex items-center justify-center bg-black snap-start"
    >
      {/* Vídeo */}
      <video
        ref={videoRef}
        src={reel.videoUrl}
        poster={reel.thumbnailUrl ?? undefined}
        loop
        playsInline
        muted={isMuted}
        onClick={handleVideoClick}
        className="h-full w-full object-contain cursor-pointer"
      />

      {/* Overlay: info y controles */}
      <div className="absolute inset-0 pointer-events-none">

        {/* Gradient inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Info del autor (izquierda inferior) */}
        <div className="absolute bottom-20 left-4 right-16 pointer-events-auto">
          <button
            onClick={() => navigate(`/profile/${reel.author.id}`)}
            className="flex items-center gap-2 mb-2"
          >
            <Avatar size="sm" src={reel.author.avatar} alt={reel.author.name} />
            <span className="text-sm font-semibold text-white drop-shadow">
              {reel.author.name}
            </span>
          </button>
          {reel.caption && (
            <p className="text-sm text-white/90 leading-relaxed line-clamp-2 drop-shadow">
              {reel.caption}
            </p>
          )}
        </div>

        {/* Controles (derecha) */}
        <div className="absolute right-3 bottom-24 flex flex-col items-center gap-5 pointer-events-auto">

          {/* Like */}
          <button
            onClick={() => toggleLike.mutate({ reelId: reel.id, isLiked: reel.isLiked })}
            className="flex flex-col items-center gap-1"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${
              reel.isLiked ? 'bg-red-500/80' : 'bg-white/20'
            }`}>
              <Heart
                size={20}
                className={reel.isLiked ? 'text-white fill-white' : 'text-white'}
              />
            </div>
            <span className="text-xs text-white font-medium drop-shadow">{reel.likesCount}</span>
          </button>

          {/* Mute */}
          <button
            onClick={onMuteToggle}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
          >
            {isMuted
              ? <VolumeX size={18} className="text-white" />
              : <Volume2 size={18} className="text-white" />
            }
          </button>
        </div>

        {/* Pause indicator */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <div className="w-0 h-0 border-y-8 border-y-transparent border-l-[18px] border-l-white ml-1" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
