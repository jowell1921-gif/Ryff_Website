import { useState, useRef } from 'react'
import { X, Upload, Film } from 'lucide-react'
import { useUploadReel } from '../hooks/useReels'

interface UploadReelModalProps {
  onClose: () => void
}

export function UploadReelModal({ onClose }: UploadReelModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadReel = useUploadReel()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const handleSubmit = async () => {
    if (!file) return
    await uploadReel.mutateAsync({ file, caption: caption.trim() || undefined })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-bold text-[var(--color-text)]">Subir reel</h2>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">

          {/* Zona de selección de vídeo */}
          {!preview ? (
            <button
              onClick={() => inputRef.current?.click()}
              className="h-48 rounded-xl border-2 border-dashed border-[var(--color-border)] hover:border-purple-500/50 transition-colors flex flex-col items-center justify-center gap-3 text-[var(--color-text-muted)] hover:text-purple-300"
            >
              <Film size={32} />
              <span className="text-sm font-medium">Seleccionar vídeo</span>
              <span className="text-xs opacity-60">MP4, MOV, WebM</span>
            </button>
          ) : (
            <div className="relative rounded-xl overflow-hidden h-48 bg-black">
              <video src={preview} className="w-full h-full object-contain" controls />
              <button
                onClick={() => { setFile(null); setPreview(null) }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/mov,video/webm,video/quicktime"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Caption */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Añade un caption..."
            rows={2}
            maxLength={200}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-purple-500 transition-colors resize-none"
          />

          {/* Botones */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!file || uploadReel.isPending}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {uploadReel.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload size={15} />
                  Publicar
                </>
              )}
            </button>
          </div>

          {uploadReel.isPending && (
            <p className="text-xs text-center text-[var(--color-text-muted)]">
              Subiendo a Cloudinary, puede tardar unos segundos...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
