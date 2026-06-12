import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react'
import { isAxiosError } from 'axios'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api } from '@/lib/api'

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe tener al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [done, setDone] = useState(false)
  const token = searchParams.get('token')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/reset-password', { token, password: data.password })
      setDone(true)
      setTimeout(() => navigate('/auth/login'), 3000)
    } catch (error) {
      if (isAxiosError(error)) {
        setError('root', { message: error.response?.data?.message ?? 'Error al restablecer la contraseña.' })
      } else {
        setError('root', { message: 'Algo salió mal. Inténtalo de nuevo.' })
      }
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-3">Enlace inválido</h2>
        <p className="text-[var(--color-text-muted)] mb-8" style={{ fontSize: 14 }}>
          Este enlace de recuperación no es válido o ha expirado.
        </p>
        <Link
          to="/auth/forgot-password"
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          Solicitar un nuevo enlace
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
            <CheckCircle size={32} className="text-purple-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-3">¡Contraseña actualizada!</h2>
        <p className="text-[var(--color-text-muted)]" style={{ fontSize: 14 }}>
          Redirigiendo al inicio de sesión...
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Nueva contraseña</h2>
        <p className="text-[var(--color-text-muted)] mt-1" style={{ fontSize: 14 }}>
          Elige una contraseña segura para tu cuenta.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Input
          label="Nueva contraseña"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock size={14} />}
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirmar contraseña"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock size={14} />}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {errors.root && (
          <p className="text-sm text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2.5 px-3">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} className="w-full">
          {isSubmitting ? 'Guardando...' : 'Guardar nueva contraseña'}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <Link
          to="/auth/login"
          className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-purple-400 transition-colors"
        >
          <ArrowLeft size={15} />
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}
