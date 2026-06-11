import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useUpdateProfile } from '../hooks/useProfile'
import { LocationAutocomplete } from './LocationAutocomplete'
import { TagSelector } from './TagSelector'
import { INSTRUMENTS, GENRES, ROLES } from '../constants/musicData'
import type { UserProfile } from '@/types/user.types'

const editSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  bio: z.string().max(300, 'Máximo 300 caracteres').optional(),
})

type EditFormData = z.infer<typeof editSchema>

interface EditProfileModalProps {
  profile: UserProfile
  onClose: () => void
}

export function EditProfileModal({ profile, onClose }: EditProfileModalProps) {
  const [location, setLocation] = useState(profile.location ?? '')
  const [role, setRole] = useState(profile.role ?? '')
  const [mainInstrument, setMainInstrument] = useState<string[]>(
    profile.mainInstrument ? [profile.mainInstrument] : []
  )
  const [instruments, setInstruments] = useState<string[]>(profile.instruments)
  const [genres, setGenres] = useState<string[]>(profile.genres)

  const { mutate: updateProfile, isPending } = useUpdateProfile()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: profile.name,
      bio: profile.bio ?? '',
    },
  })

  // Cierra con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const onSubmit = (data: EditFormData) => {
    updateProfile(
      { ...data, location, role: role || undefined, mainInstrument: mainInstrument[0] ?? null, instruments, genres },
      { onSuccess: onClose }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-surface-2)] z-10" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <h2 className="text-lg font-bold text-[var(--color-text)]">Editar perfil</h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
            style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Nombre */}
          <Input
            label="Nombre artístico"
            error={errors.name?.message}
            {...register('name')}
          />

          {/* Soy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="text-sm font-medium text-[var(--color-text-muted)]">Soy</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] outline-none focus:border-purple-500 transition-colors cursor-pointer"
              style={{ padding: '10px 12px', appearance: 'auto' }}
            >
              <option value="">— Sin especificar —</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Bio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="text-sm font-medium text-[var(--color-text-muted)]">Bio</label>
            <textarea
              {...register('bio')}
              rows={3}
              placeholder="Cuéntale al mundo quién eres musicalmente..."
              className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-purple-500 resize-none transition-colors"
              style={{ padding: '14px 12px' }}
            />
            {errors.bio && (
              <p className="text-xs text-red-400">{errors.bio.message}</p>
            )}
          </div>

          {/* Ubicación con autocompletado */}
          <LocationAutocomplete value={location} onChange={setLocation} />

          {/* Instrumento principal */}
          <TagSelector
            label="Mi instrumento principal"
            placeholder="Buscar instrumento..."
            options={INSTRUMENTS}
            selected={mainInstrument}
            onChange={setMainInstrument}
            maxItems={1}
          />

          {/* Instrumentos */}
          <TagSelector
            label="Instrumentos que puedo tocar"
            placeholder="Buscar instrumento..."
            options={INSTRUMENTS}
            selected={instruments}
            onChange={setInstruments}
            maxItems={10}
          />

          {/* Géneros musicales */}
          <TagSelector
            label="Géneros musicales favoritos"
            placeholder="Buscar género..."
            options={GENRES}
            selected={genres}
            onChange={setGenres}
            maxItems={10}
          />

          {/* Acciones */}
          <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isPending}
            >
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
