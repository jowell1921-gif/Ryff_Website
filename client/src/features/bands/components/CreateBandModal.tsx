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
      <div className="w-full max-w-md bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-base font-bold text-[var(--color-text)]">Crear banda</h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">

          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
              Nombre de la banda *
            </label>
            <input
              {...register('name')}
              placeholder="Los Acordes Perdidos"
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-purple-500 transition-colors"
            />
            {errors.name && (
              <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
              Descripción
            </label>
            <textarea
              {...register('description')}
              placeholder="Contad quiénes sois, qué tocáis, qué buscáis..."
              rows={3}
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-purple-500 transition-colors resize-none"
            />
            {errors.description && (
              <p className="text-xs text-red-400 mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
              Ubicación
            </label>
            <LocationAutocomplete value={location} onChange={setLocation} />
          </div>

          {/* Géneros */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
              Géneros
            </label>
            <TagSelector
              options={GENRES}
              selected={genres}
              onChange={setGenres}
              placeholder="Escribe un género..."
            />
          </div>

          {/* Buscamos */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
              Buscamos (instrumentos que necesitáis)
            </label>
            <TagSelector
              options={INSTRUMENTS}
              selected={lookingFor}
              onChange={setLookingFor}
              placeholder="Ej: Batería, Bajo..."
            />
          </div>

          {/* Tu instrumento en la banda */}
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">
              Tu instrumento en la banda
            </label>
            <TagSelector
              options={INSTRUMENTS}
              selected={creatorInstrument ? [creatorInstrument] : []}
              onChange={(vals) => setCreatorInstrument(vals[vals.length - 1] ?? '')}
              placeholder="Ej: Guitarra..."
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createBand.isPending}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50"
            >
              {createBand.isPending ? 'Creando...' : 'Crear banda'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
