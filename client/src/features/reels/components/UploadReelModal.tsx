import { useState, useRef } from 'react'
import { X, Film, Upload } from 'lucide-react'
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

  const MAX_CAPTION = 150
  const remaining = MAX_CAPTION - caption.length

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
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-[var(--color-surface-2)] border border-[var(--color-border)]"
        style={{ width: '100%', maxWidth: 400, borderRadius: 20, overflow: 'hidden' }}
      >
        {/* Header */}
        <div
          className="border-b border-[var(--color-border)]"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}
        >
          <h2 className="text-[var(--color-text)]" style={{ fontSize: 16, fontWeight: 700 }}>
            Subir reel
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Zona de selección de vídeo */}
          {!preview ? (
            <button
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-[var(--color-border)] hover:border-purple-500/50 text-[var(--color-text-muted)] hover:text-purple-300 transition-colors"
              style={{
                height: 180, borderRadius: 14,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
              }}
            >
              <Film size={32} />
              <span style={{ fontSize: 14, fontWeight: 600 }}>Seleccionar vídeo</span>
              <span className="text-[var(--color-text-muted)]" style={{ fontSize: 12, opacity: 0.6 }}>
                MP4, MOV, WebM
              </span>
            </button>
          ) : (
            <div
              className="bg-black"
              style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', height: 180 }}
            >
              <video
                src={preview}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                controls
              />
              <button
                onClick={() => { setFile(null); setPreview(null) }}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.65)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white',
                }}
                className="hover:bg-black/90 transition-colors"
              >
                <X size={13} />
              </button>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="video/mp4,video/mov,video/webm,video/quicktime"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {/* Caption */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="text-[var(--color-text-muted)]" style={{ fontSize: 12, fontWeight: 600 }}>
              Caption
            </label>
            <div
              className="border border-[var(--color-border)] bg-[var(--color-surface)]"
              style={{ borderRadius: 12, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}
            >
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
                placeholder="Añade un caption..."
                rows={2}
                className="bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                style={{ border: 'none', outline: 'none', fontSize: 13, lineHeight: 1.5, resize: 'none', width: '100%', fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <span
                  className={remaining < 20 ? 'text-orange-400' : 'text-[var(--color-text-muted)]'}
                  style={{ fontSize: 11 }}
                >
                  {remaining}
                </span>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              className="border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-text-muted)] transition-colors"
              style={{ flex: 1, padding: '10px 0', borderRadius: 12, fontSize: 14, fontWeight: 600 }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!file || uploadReel.isPending}
              className="bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50"
              style={{ flex: 1, padding: '10px 0', borderRadius: 12, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {uploadReel.isPending ? (
                <>
                  <div
                    className="border-2 border-white/30 border-t-white rounded-full animate-spin"
                    style={{ width: 15, height: 15 }}
                  />
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

          {/* Mensaje de progreso */}
          {uploadReel.isPending && (
            <p className="text-[var(--color-text-muted)]" style={{ fontSize: 12, textAlign: 'center' }}>
              Subiendo a Cloudinary, puede tardar unos segundos…
            </p>
          )}

        </div>
      </div>
    </div>
  )
}
