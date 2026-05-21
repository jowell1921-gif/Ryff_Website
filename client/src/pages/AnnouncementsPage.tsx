import { useState } from 'react'
import { MapPin, Music2, Users, X, Plus, Search, Trash2 } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from '@/features/announcements/hooks/useAnnouncements'
import { useAuthStore } from '@/stores/authStore'
import type { Announcement, AnnouncementType } from '@/types/announcement.types'
import { INSTRUMENTS, GENRES } from '@/features/profile/constants/musicData'

const TYPE_LABELS: Record<AnnouncementType, string> = {
  BUSCO_MUSICO: 'Busco músico',
  BUSCO_BANDA: 'Busco banda',
}

export function AnnouncementsPage() {
  const currentUser = useAuthStore((s) => s.user)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  const [showForm, setShowForm] = useState(false)

  const { data: announcements = [], isLoading } = useAnnouncements({
    search: search || undefined,
    type: filterType || undefined,
  })
  const createAnnouncement = useCreateAnnouncement()
  const deleteAnnouncement = useDeleteAnnouncement()

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', paddingLeft: 16, paddingRight: 16, paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid var(--color-border)', marginBottom: 24 }}>
        <h1 className="text-[var(--color-text)]" style={{ fontSize: 17, fontWeight: 700 }}>Anuncios</h1>
        <button
          onClick={() => setShowForm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 20px', borderRadius: 999, fontSize: 13, fontWeight: 700, border: '1px solid', transition: 'all 0.2s' }}
          className="bg-purple-600 text-white border-purple-500 hover:bg-purple-700 hover:scale-105"
        >
          <Plus size={15} />
          Crear anuncio
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div
          className="border border-[var(--color-border)] bg-[var(--color-surface-2)]"
          style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 12, padding: '10px 14px', flex: 1 }}
        >
          <Search size={15} className="text-[var(--color-text-muted)]" style={{ flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar anuncios..."
            className="bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
            style={{ flex: 1, outline: 'none', border: 'none', fontSize: 14 }}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)]"
          style={{ padding: '10px 14px', borderRadius: 12, fontSize: 14, outline: 'none', cursor: 'pointer' }}
        >
          <option value="">Todos</option>
          <option value="BUSCO_MUSICO">Busco músico</option>
          <option value="BUSCO_BANDA">Busco banda</option>
        </select>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-[var(--color-surface-2)] animate-pulse" style={{ height: 140 }} />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div className="bg-purple-600/10 rounded-2xl" style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Music2 size={22} className="text-purple-400" />
          </div>
          <p className="text-[var(--color-text)]" style={{ fontSize: 15, fontWeight: 600 }}>No hay anuncios aún</p>
          <p className="text-[var(--color-text-muted)]" style={{ fontSize: 14 }}>¡Sé el primero en publicar uno!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {announcements.map((ann) => (
            <AnnouncementCard
              key={ann.id}
              announcement={ann}
              isOwn={ann.author.id === currentUser?.id}
              onDelete={() => deleteAnnouncement.mutate(ann.id)}
              deleting={deleteAnnouncement.isPending && deleteAnnouncement.variables === ann.id}
            />
          ))}
        </div>
      )}

      {/* Modal crear anuncio */}
      {showForm && (
        <CreateAnnouncementModal
          onClose={() => setShowForm(false)}
          onSubmit={async (data) => {
            await createAnnouncement.mutateAsync(data)
            setShowForm(false)
          }}
          isPending={createAnnouncement.isPending}
        />
      )}
    </div>
  )
}

function AnnouncementCard({
  announcement,
  isOwn,
  onDelete,
  deleting,
}: {
  announcement: Announcement
  isOwn: boolean
  onDelete: () => void
  deleting: boolean
}) {
  const isMusico = announcement.type === 'BUSCO_MUSICO'

  return (
    <div
      className="bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-purple-500/25 transition-colors"
      style={{ borderRadius: 18, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Avatar size="sm" src={announcement.author.avatar} alt={announcement.author.name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="text-[var(--color-text)]" style={{ fontSize: 14, fontWeight: 600 }}>{announcement.author.name}</span>
            <span
              className={isMusico ? 'bg-purple-600/15 border border-purple-500/30' : 'bg-blue-600/15 border border-blue-500/30'}
              style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, color: isMusico ? 'rgb(196,167,255)' : 'rgb(147,197,253)' }}
            >
              {TYPE_LABELS[announcement.type]}
            </span>
          </div>
          {announcement.author.location && (
            <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, marginTop: 3 }} className="text-[var(--color-text-muted)]">
              <MapPin size={11} />
              {announcement.author.location}
            </p>
          )}
        </div>
        {isOwn && (
          <button
            onClick={onDelete}
            disabled={deleting}
            className="text-[var(--color-text-muted)] hover:text-red-400 transition-colors disabled:opacity-50"
            title="Eliminar anuncio"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Contenido */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h3 className="text-[var(--color-text)]" style={{ fontSize: 15, fontWeight: 700 }}>{announcement.title}</h3>
        <p className="text-[var(--color-text-muted)]" style={{ fontSize: 14, lineHeight: 1.6 }}>{announcement.description}</p>
      </div>

      {/* Pills */}
      {(announcement.instruments.length > 0 || announcement.genres.length > 0) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {announcement.instruments.map((inst) => (
            <span
              key={inst}
              className="rounded-full bg-purple-600 border border-purple-500 font-semibold"
              style={{ padding: '4px 12px', fontSize: 11, color: 'white' }}
            >
              {inst}
            </span>
          ))}
          {announcement.genres.map((g) => (
            <span
              key={g}
              className="rounded-full border border-purple-500/30 bg-purple-500/10 font-semibold"
              style={{ padding: '4px 12px', fontSize: 11, color: 'white' }}
            >
              {g}
            </span>
          ))}
        </div>
      )}

      {announcement.location && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }} className="text-[var(--color-text-muted)]">
          <MapPin size={12} />
          {announcement.location}
        </p>
      )}
    </div>
  )
}

interface CreateAnnouncementModalProps {
  onClose: () => void
  onSubmit: (data: {
    type: AnnouncementType
    title: string
    description: string
    instruments?: string[]
    genres?: string[]
    location?: string
  }) => Promise<void>
  isPending: boolean
}

function CreateAnnouncementModal({ onClose, onSubmit, isPending }: CreateAnnouncementModalProps) {
  const [type, setType] = useState<AnnouncementType>('BUSCO_MUSICO')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [instSearch, setInstSearch] = useState('')
  const [genreSearch, setGenreSearch] = useState('')
  const [showInstDropdown, setShowInstDropdown] = useState(false)
  const [showGenreDropdown, setShowGenreDropdown] = useState(false)

  const filteredInstruments = INSTRUMENTS.filter(
    (i) => i.toLowerCase().includes(instSearch.toLowerCase()) && !selectedInstruments.includes(i)
  ).slice(0, 6)

  const filteredGenres = GENRES.filter(
    (g) => g.toLowerCase().includes(genreSearch.toLowerCase()) && !selectedGenres.includes(g)
  ).slice(0, 6)

  const removeItem = (arr: string[], item: string, setArr: (v: string[]) => void) =>
    setArr(arr.filter((x) => x !== item))

  const addItem = (arr: string[], item: string, setArr: (v: string[]) => void, max: number) => {
    if (arr.length < max) setArr([...arr, item])
  }

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return
    await onSubmit({
      type,
      title: title.trim(),
      description: description.trim(),
      instruments: selectedInstruments,
      genres: selectedGenres,
      location: location.trim() || undefined,
    })
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-surface-2)] border border-[var(--color-border)]"
        style={{ borderRadius: 22, width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="border-b border-[var(--color-border)]"
          style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}
        >
          <h2 className="text-[var(--color-text)]" style={{ fontSize: 16, fontWeight: 700 }}>Crear anuncio</h2>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo scrollable */}
        <div style={{ overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Tipo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="text-[var(--color-text)]" style={{ fontSize: 13, fontWeight: 600 }}>Tipo de anuncio</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['BUSCO_MUSICO', 'BUSCO_BANDA'] as AnnouncementType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={type === t ? 'bg-purple-600 border-purple-500' : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-purple-500/40 transition-colors'}
                  style={{ padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600, border: '1px solid', color: type === t ? 'white' : undefined, flex: 1 }}
                >
                  {t === 'BUSCO_MUSICO' ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Users size={13} /> Busco músico
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Music2 size={13} /> Busco banda
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="text-[var(--color-text)]" style={{ fontSize: 13, fontWeight: 600 }}>Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="Ej: Baterista para banda de rock buscado"
              className="border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
              style={{ padding: '12px 14px', borderRadius: 12, fontSize: 14, outline: 'none' }}
            />
          </div>

          {/* Descripción */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="text-[var(--color-text)]" style={{ fontSize: 13, fontWeight: 600 }}>Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Describe lo que buscas, experiencia requerida, estilo de música..."
              className="border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
              style={{ padding: '12px 14px', borderRadius: 12, fontSize: 14, outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {/* Instrumentos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="text-[var(--color-text)]" style={{ fontSize: 13, fontWeight: 600 }}>Instrumentos buscados</label>
            {selectedInstruments.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selectedInstruments.map((inst) => (
                  <span
                    key={inst}
                    className="bg-purple-600 border border-purple-500 rounded-full font-semibold"
                    style={{ padding: '4px 12px', fontSize: 12, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {inst}
                    <button onClick={() => removeItem(selectedInstruments, inst, setSelectedInstruments)} style={{ display: 'flex' }}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <input
                value={instSearch}
                onChange={(e) => { setInstSearch(e.target.value); setShowInstDropdown(true) }}
                onFocus={() => setShowInstDropdown(true)}
                onBlur={() => setTimeout(() => setShowInstDropdown(false), 150)}
                placeholder="Buscar instrumento..."
                className="border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, fontSize: 14, outline: 'none' }}
              />
              {showInstDropdown && filteredInstruments.length > 0 && (
                <div
                  className="bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                  style={{ position: 'absolute', top: '100%', left: 0, right: 0, borderRadius: 12, marginTop: 4, zIndex: 10, overflow: 'hidden' }}
                >
                  {filteredInstruments.map((inst) => (
                    <button
                      key={inst}
                      onMouseDown={(e) => { e.preventDefault(); addItem(selectedInstruments, inst, setSelectedInstruments, 8); setInstSearch('') }}
                      className="w-full text-left text-[var(--color-text)] hover:bg-[var(--color-surface-3)] transition-colors"
                      style={{ padding: '10px 14px', fontSize: 14, display: 'block' }}
                    >
                      {inst}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Géneros */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="text-[var(--color-text)]" style={{ fontSize: 13, fontWeight: 600 }}>Géneros musicales</label>
            {selectedGenres.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selectedGenres.map((g) => (
                  <span
                    key={g}
                    className="border border-purple-500/30 bg-purple-500/10 rounded-full font-semibold"
                    style={{ padding: '4px 12px', fontSize: 12, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {g}
                    <button onClick={() => removeItem(selectedGenres, g, setSelectedGenres)} style={{ display: 'flex' }}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <input
                value={genreSearch}
                onChange={(e) => { setGenreSearch(e.target.value); setShowGenreDropdown(true) }}
                onFocus={() => setShowGenreDropdown(true)}
                onBlur={() => setTimeout(() => setShowGenreDropdown(false), 150)}
                placeholder="Buscar género..."
                className="border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 12, fontSize: 14, outline: 'none' }}
              />
              {showGenreDropdown && filteredGenres.length > 0 && (
                <div
                  className="bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                  style={{ position: 'absolute', top: '100%', left: 0, right: 0, borderRadius: 12, marginTop: 4, zIndex: 10, overflow: 'hidden' }}
                >
                  {filteredGenres.map((g) => (
                    <button
                      key={g}
                      onMouseDown={(e) => { e.preventDefault(); addItem(selectedGenres, g, setSelectedGenres, 6); setGenreSearch('') }}
                      className="w-full text-left text-[var(--color-text)] hover:bg-[var(--color-surface-3)] transition-colors"
                      style={{ padding: '10px 14px', fontSize: 14, display: 'block' }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ubicación */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="text-[var(--color-text)]" style={{ fontSize: 13, fontWeight: 600 }}>Ubicación <span className="text-[var(--color-text-muted)] font-normal">(opcional)</span></label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ciudad o zona"
              className="border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
              style={{ padding: '12px 14px', borderRadius: 12, fontSize: 14, outline: 'none' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          className="border-t border-[var(--color-border)]"
          style={{ padding: '16px 24px', display: 'flex', gap: 10, justifyContent: 'flex-end', flexShrink: 0 }}
        >
          <button
            onClick={onClose}
            className="border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            style={{ padding: '9px 20px', borderRadius: 999, fontSize: 14, fontWeight: 600 }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !title.trim() || !description.trim()}
            className="bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50"
            style={{ padding: '9px 22px', borderRadius: 999, fontSize: 14, fontWeight: 700, color: 'white' }}
          >
            {isPending ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  )
}
