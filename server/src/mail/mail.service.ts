import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)
  private resend: Resend | null = null

  constructor(private config: ConfigService) {
    const apiKey = config.get<string>('RESEND_API_KEY')
    if (apiKey) {
      this.resend = new Resend(apiKey)
    }
  }

  async sendPasswordReset(email: string, name: string, token: string) {
    const clientUrl = this.config.get('CLIENT_URL')
    const resetUrl = `${clientUrl}/auth/reset-password?token=${token}`

    if (!this.resend) {
      this.logger.warn('⚠️  RESEND_API_KEY no configurado — link de reset en consola:')
      this.logger.warn(`🔗 ${resetUrl}`)
      return
    }

    const { error } = await this.resend.emails.send({
      from: 'RYFF <onboarding@resend.dev>',
      to: email,
      subject: 'Recupera tu contraseña de RYFF',
      html: this.buildHtml(name, resetUrl),
    })

    if (error) {
      this.logger.error(`❌ Resend error: ${error.message}`)
      throw new InternalServerErrorException('No se pudo enviar el email.')
    }

    this.logger.log(`✅ Password reset email sent to ${email}`)
  }

  private buildHtml(name: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#0f0f13;font-family:'Inter',Arial,sans-serif;">
        <div style="max-width:520px;margin:40px auto;background:#1a1a24;border-radius:16px;border:1px solid #2e2e40;overflow:hidden;">

          <div style="background:linear-gradient(135deg,#4c1d95,#1a1a24);padding:40px 32px;text-align:center;">
            <h1 style="color:#f1f0f5;font-size:28px;font-weight:900;letter-spacing:-1px;margin:0;">RYFF</h1>
            <p style="color:#c4b5fd;font-size:12px;margin:4px 0 0;letter-spacing:3px;text-transform:uppercase;">Tu escena musical</p>
          </div>

          <div style="padding:40px 32px;">
            <h2 style="color:#f1f0f5;font-size:22px;font-weight:700;margin:0 0 12px;">Hola, ${name} 👋</h2>
            <p style="color:#8b8a9b;font-size:15px;line-height:1.6;margin:0 0 28px;">
              Recibimos una solicitud para restablecer la contraseña de tu cuenta de RYFF.
              Haz clic en el botón para crear una contraseña nueva.
            </p>

            <div style="text-align:center;margin-bottom:32px;">
              <a href="${resetUrl}"
                style="display:inline-block;background:linear-gradient(135deg,#9333ea,#4f46e5);color:white;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:999px;">
                Restablecer contraseña
              </a>
            </div>

            <p style="color:#8b8a9b;font-size:13px;line-height:1.6;margin:0 0 8px;">
              Este enlace expira en <strong style="color:#c4b5fd;">1 hora</strong>.
              Si no solicitaste este cambio, ignora este email.
            </p>

            <div style="margin-top:24px;padding-top:24px;border-top:1px solid #2e2e40;">
              <p style="color:#8b8a9b;font-size:12px;margin:0;">
                Si el botón no funciona, copia este enlace:<br>
                <a href="${resetUrl}" style="color:#9333ea;word-break:break-all;">${resetUrl}</a>
              </p>
            </div>
          </div>

          <div style="padding:20px 32px;border-top:1px solid #2e2e40;text-align:center;">
            <p style="color:#8b8a9b;font-size:11px;margin:0;">© ${new Date().getFullYear()} RYFF. Todos los derechos reservados.</p>
          </div>

        </div>
      </body>
      </html>
    `
  }
}
