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
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative h-screen bg-black overflow-y-scroll snap-y snap-mandatory scroll-smooth">

      {/* Botón subir reel — fijo arriba a la derecha */}
      <button
        onClick={() => setShowUpload(true)}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center shadow-lg transition-colors"
      >
        <Plus size={20} className="text-white" />
      </button>

      {reels.length === 0 ? (
        <div className="h-screen flex flex-col items-center justify-center gap-4 text-center px-8">
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

      {showUpload && <UploadReelModal onClose={() => setShowUpload(false)} />}
    </div>
  )
}
