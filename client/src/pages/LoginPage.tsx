import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { isAxiosError } from 'axios'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/features/auth/services/authService'

const loginSchema = z.object({
  email: z.string().email('Introduce un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await authService.login(data)
      setAuth(response.user, response.tokens)
      navigate('/feed')
    } catch (error) {
      // isAxiosError nos permite distinguir errores de red de errores del servidor
      if (isAxiosError(error)) {
        const message = error.response?.data?.message ?? 'Error al conectar con el servidor'
        setError('root', { message })
      } else {
        setError('root', { message: 'Algo salió mal. Inténtalo de nuevo.' })
      }
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Bienvenido de nuevo</h2>
        <p className="text-[var(--color-text-muted)] mt-1">Entra a tu cuenta de RYFF</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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

        {errors.root && (
          <p className="text-sm text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2.5 px-3">
            {errors.root.message}
          </p>
        )}

        <div className="flex justify-end">
          <Link
            to="/auth/forgot-password"
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} className="w-full mt-1">
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--color-text-muted)] mt-8">
        ¿No tienes cuenta?{' '}
        <Link to="/auth/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
          Créala gratis
        </Link>
      </p>
    </div>
  )
}
