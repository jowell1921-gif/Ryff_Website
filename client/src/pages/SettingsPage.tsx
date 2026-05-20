import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { LogOut, Mail, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore } from '@/stores/authStore'
import { useUpdateProfile } from '@/features/profile/hooks/useProfile'
import { LocationAutocomplete } from '@/features/profile/components/LocationAutocomplete'
import { TagSelector } from '@/features/profile/components/TagSelector'
import { INSTRUMENTS, GENRES } from '@/features/profile/constants/musicData'

const profileSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  bio: z.string().max(300, 'Máximo 300 caracteres').optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [location, setLocation] = useState(user?.location ?? '')
  const [instruments, setInstruments] = useState<string[]>(user?.instruments ?? [])
  const [genres, setGenres] = useState<string[]>(user?.genres ?? [])

  const { mutate: updateProfile, isPending } = useUpdateProfile()

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', bio: user?.bio ?? '' },
  })

  const onSubmit = (data: ProfileFormData) => {
    updateProfile(
      { ...data, location, instruments, genres },
      {
        onSuccess: () => {
          setSaved(true)
          setTimeout(() => setSaved(false), 2500)
        },
      }
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/auth/login')
  }

  const memberSince = user?.createdAt
    ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: es })
    : ''

  return (
    <div style={{ maxWidth: 672, margin: '0 auto', paddingLeft: 16, paddingRight: 16, paddingTop: 32, paddingBottom: 32, display: 'flex', flexDirection: 'column', gap: 32 }}>

      <h1 className="text-xl font-bold text-[var(--color-text)]">Configuración</h1>

      {/* ── Perfil ── */}
      <section
        className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl"
        style={{ padding: 28 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Cabecera de sección */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar size="lg" src={user?.avatar ?? null} alt={user?.name ?? ''} />
            <div>
              <h2 className="text-base font-bold text-[var(--color-text)]">Mi perfil</h2>
              <p className="text-sm text-[var(--color-text-muted)]">Cómo te ven otros músicos en RYFF</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            <Input
              label="Nombre artístico"
              error={errors.name?.message}
              {...register('name')}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="text-sm font-medium text-[var(--color-text-muted)]">Bio</label>
              <textarea
                {...register('bio')}
                rows={3}
                placeholder="Cuéntale al mundo quién eres musicalmente..."
                className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-purple-500 resize-none transition-colors"
                style={{ padding: 12 }}
              />
              {errors.bio && <p className="text-xs text-red-400">{errors.bio.message}</p>}
            </div>

            <LocationAutocomplete value={location} onChange={setLocation} />

            <TagSelector
              label="Instrumentos"
              placeholder="Buscar instrumento..."
              options={INSTRUMENTS}
              selected={instruments}
              onChange={setInstruments}
              maxItems={10}
            />

            <TagSelector
              label="Géneros musicales"
              placeholder="Buscar género..."
              options={GENRES}
              selected={genres}
              onChange={setGenres}
              maxItems={10}
            />

            <div className="flex justify-end">
              <Button type="submit" variant="primary" isLoading={isPending}>
                {saved ? '¡Guardado!' : 'Guardar cambios'}
              </Button>
            </div>

          </form>
        </div>
      </section>

      {/* ── Cuenta ── */}
      <section
        className="bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl"
        style={{ padding: 28 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <h2 className="text-base font-bold text-[var(--color-text)]">Cuenta</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="flex items-center gap-3">
              <Mail size={15} className="text-[var(--color-text-muted)] shrink-0" />
              <span className="text-sm text-[var(--color-text-muted)]">Email</span>
              <span className="text-sm text-[var(--color-text)] font-medium ml-auto">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={15} className="text-[var(--color-text-muted)] shrink-0" />
              <span className="text-sm text-[var(--color-text-muted)]">Miembro</span>
              <span className="text-sm text-[var(--color-text)] font-medium ml-auto">{memberSince}</span>
            </div>
          </div>

          <div className="border-t border-[var(--color-border)]" style={{ paddingTop: 20 }}>
            <Button variant="danger" onClick={handleLogout}>
              <LogOut size={15} />
              Cerrar sesión
            </Button>
          </div>

        </div>
      </section>

    </div>
  )
}
