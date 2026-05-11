import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/authStore'

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
      // Mock — lo reemplazaremos por authService.login(data) cuando tengamos backend
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulamos la respuesta del servidor
      setAuth(
        {
          id: '1',
          name: 'Joel Osorio',
          email: data.email,
          avatar: null,
          bio: null,
          location: 'Madrid',
          instruments: ['Guitarra'],
          genres: ['Rock', 'Shoegaze'],
          createdAt: new Date().toISOString(),
        },
        {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        }
      )

      navigate('/feed')
    } catch {
      // Cuando conectemos el backend real, aquí manejaremos errores como "credenciales incorrectas"
      setError('root', { message: 'Email o contraseña incorrectos' })
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

        {/* Error general del formulario — credenciales incorrectas, etc. */}
        {errors.root && (
          <p className="text-sm text-red-400 text-center">{errors.root.message}</p>
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
