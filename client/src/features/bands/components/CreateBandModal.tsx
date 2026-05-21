import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { TagSelector } from '@/features/profile/components/TagSelector'
import { LocationAutocomplete } from '@/features/profile/components/LocationAutocomplete'
import { GENRES, INSTRUMENTS } from '@/features/profile/constants/musicData'
import { useCreateBand } from '../hooks/useBands'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(60, 'Máximo 60 caracteres'),
  description: z.string().max(400).optional(),
})

type FormValues = z.infer<typeof schema>

interface CreateBandModalProps {
  onClose: () => void
}

export function CreateBandModal({ onClose }: CreateBandModalProps) {
  const [location, setLocation] = useState('')
  const [genres, setGenres] = useState<string[]>([])
  const [lookingFor, setLookingFor] = useState<string[]>([])
  const [creatorInstrument, setCreatorInstrument] = useState('')

  const createBand = useCreateBand()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    await createBand.mutateAsync({
      name: values.name,
      description: values.description,
      genres,
      location: location || undefined,
      lookingFor,
      creatorInstrument: creatorInstrument || undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl overflow-hidden">

        {/* Header */}
        <div
          className="border-b border-[var(--color-border)]"
          style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
        >
          <h2 className="text-[var(--color-text)]" style={{ fontSize: 16, fontWeight: 700 }}>Crear banda</h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)' }}
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24, maxHeight: '75vh', overflowY: 'auto' }}
        >
          {/* Nombre */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="text-sm font-medium text-[var(--color-text-muted)]">
              Nombre de la banda <span className="text-purple-400">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="Los Acordes Perdidos"
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-purple-500 transition-colors"
              style={{ paddingTop: 18, paddingBottom: 18, paddingLeft: 16, paddingRight: 16 }}
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="text-sm font-medium text-[var(--color-text-muted)]">Descripción</label>
            <textarea
              {...register('description')}
              placeholder="Contad quiénes sois, qué tocáis, qué buscáis..."
              rows={3}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-purple-500 transition-colors resize-none"
              style={{ padding: '14px 16px' }}
            />
            {errors.description && (
              <p className="text-xs text-red-400">{errors.description.message}</p>
            )}
          </div>

          {/* Ubicación */}
          <LocationAutocomplete value={location} onChange={setLocation} />

          {/* Géneros */}
          <TagSelector
            label="Géneros"
            options={GENRES}
            selected={genres}
            onChange={setGenres}
            placeholder="Escribe un género..."
          />

          {/* Buscamos */}
          <TagSelector
            label="Buscamos (instrumentos que necesitáis)"
            options={INSTRUMENTS}
            selected={lookingFor}
            onChange={setLookingFor}
            placeholder="Ej: Batería, Bajo..."
          />

          {/* Tu instrumento */}
          <TagSelector
            label="Tu instrumento en la banda"
            options={INSTRUMENTS}
            selected={creatorInstrument ? [creatorInstrument] : []}
            onChange={(vals) => setCreatorInstrument(vals[vals.length - 1] ?? '')}
            placeholder="Ej: Guitarra..."
            maxItems={1}
          />

          {/* Botones */}
          <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              className="border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              style={{ flex: 1, paddingTop: 10, paddingBottom: 10, borderRadius: 999, fontSize: 14, fontWeight: 600 }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createBand.isPending}
              className="bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50"
              style={{ flex: 1, paddingTop: 10, paddingBottom: 10, borderRadius: 999, fontSize: 14, fontWeight: 700 }}
            >
              {createBand.isPending ? 'Creando...' : 'Crear banda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
