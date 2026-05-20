import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useReels } from '@/features/reels/hooks/useReels'
import { ReelPlayer } from '@/features/reels/components/ReelPlayer'
import { UploadReelModal } from '@/features/reels/components/UploadReelModal'

export function ReelsPage() {
  const { data: reels = [], isLoading } = useReels()
  const [isMuted, setIsMuted] = useState(true)
  const [showUpload, setShowUpload] = useState(false)

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'black' }}>
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', background: 'black', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', position: 'relative' }}>

      {/* Botón subir reel */}
      <button
        onClick={() => setShowUpload(true)}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center shadow-lg transition-colors"
      >
        <Plus size={20} className="text-white" />
      </button>

      {/* Franja central estilo móvil */}
      <div style={{
        width: 390,
        height: '100vh',
        overflowY: reels.length === 0 ? 'hidden' : 'scroll',
        scrollSnapType: 'y mandatory',
        scrollBehavior: 'smooth',
        position: 'relative',
      }}>
        {reels.length === 0 ? (
          <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: '0 32px' }}>
            <p className="text-white/60 text-sm">
              Aún no hay reels. ¡Sé el primero en subir uno!
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
            >
              Subir reel
            </button>
          </div>
        ) : (
          reels.map((reel) => (
            <ReelPlayer
              key={reel.id}
              reel={reel}
              isMuted={isMuted}
              onMuteToggle={() => setIsMuted((m) => !m)}
            />
          ))
        )}
      </div>

      {showUpload && <UploadReelModal onClose={() => setShowUpload(false)} />}
    </div>
  )
}
