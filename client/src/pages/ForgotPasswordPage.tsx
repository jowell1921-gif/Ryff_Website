import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { isAxiosError } from 'axios'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api } from '@/lib/api'

const schema = z.object({
  email: z.string().email('Introduce un email válido'),
})
type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/forgot-password', { email: data.email })
      setSentEmail(data.email)
      setSent(true)
    } catch (error) {
      if (isAxiosError(error)) {
        setError('root', { message: error.response?.data?.message ?? 'Error al enviar el email.' })
      } else {
        setError('root', { message: 'Algo salió mal. Inténtalo de nuevo.' })
      }
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
            <CheckCircle size={32} className="text-purple-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-3">Revisa tu email</h2>
        <p className="text-[var(--color-text-muted)] mb-2" style={{ fontSize: 15, lineHeight: 1.6 }}>
          Si existe una cuenta asociada a
        </p>
        <p className="font-semibold text-purple-400 mb-4" style={{ fontSize: 15 }}>
          {sentEmail}
        </p>
        <p className="text-[var(--color-text-muted)] mb-8" style={{ fontSize: 14, lineHeight: 1.6 }}>
          recibirás un enlace para restablecer tu contraseña. El enlace expira en <strong className="text-[var(--color-text)]">1 hora</strong>.
        </p>
        <p className="text-[var(--color-text-muted)] mb-6" style={{ fontSize: 13 }}>
          ¿No lo ves? Revisa la carpeta de spam.
        </p>
        <Link
          to="/auth/login"
          className="flex items-center justify-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft size={15} />
          Volver al inicio de sesión
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">¿Olvidaste tu contraseña?</h2>
        <p className="text-[var(--color-text-muted)] mt-1" style={{ fontSize: 14, lineHeight: 1.6 }}>
          Introduce tu email y te enviaremos un enlace para crear una nueva.
        </p>
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

        {errors.root && (
          <p className="text-sm text-red-400 text-center bg-red-500/10 border border-red-500/20 rounded-lg py-2.5 px-3">
            {errors.root.message}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} className="w-full">
          {isSubmitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
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
