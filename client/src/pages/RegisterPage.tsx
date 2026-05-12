import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock } from 'lucide-react'
import { isAxiosError } from 'axios'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/features/auth/services/authService'

const registerSchema = z
  .object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
    email: z.string().email('Introduce un email válido'),
    password: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe tener al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      })
      setAuth(response.user, response.tokens)
      navigate('/feed')
    } catch (error) {
      if (isAxiosError(error)) {
        const message = error.response?.data?.message ?? 'Error al crear la cuenta'
        // Si el servidor dice que el email ya existe, lo mostramos en el campo email
        if (error.response?.status === 409) {
          setError('email', { message: 'Este email ya está registrado' })
        } else {
          setError('root', { message })
        }
      } else {
        setError('root', { message: 'Algo salió mal. Inténtalo de nuevo.' })
      }
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Únete a RYFF</h2>
        <p className="text-[var(--color-text-muted)] mt-1">Crea tu perfil musical en segundos</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Nombre artístico"
          placeholder="Cómo te conoce la escena"
          leftIcon={<User size={14} />}
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="tu@email.com"
          leftIcon={<Mail size={14} />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Contraseña"
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

        <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} className="w-full mt-2">
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--color-text-muted)] mt-8">
        ¿Ya tienes cuenta?{' '}
        <Link to="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
