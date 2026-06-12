import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { MailService } from '../mail/mail.service'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (exists) throw new ConflictException('Este email ya está registrado')

    const hash = await bcrypt.hash(dto.password, 12)

    const user = await this.prisma.user.create({
      data: { name: dto.name, email: dto.email, password: hash },
    })

    return this.buildAuthResponse(user)
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })

    if (!user) throw new UnauthorizedException('Credenciales incorrectas')
    if (!user.password) throw new UnauthorizedException('Esta cuenta usa Google. Inicia sesión con Google.')

    const passwordValid = await bcrypt.compare(dto.password, user.password)
    if (!passwordValid) throw new UnauthorizedException('Credenciales incorrectas')

    return this.buildAuthResponse(user)
  }

  async loginWithGoogle(profile: { email: string; name: string; avatar?: string }) {
    let user = await this.prisma.user.findUnique({ where: { email: profile.email } })

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          avatar: profile.avatar ?? null,
          password: null,
        },
      })
    }

    return this.buildAuthResponse(user)
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })

    if (!user) throw new BadRequestException('No encontramos ninguna cuenta con ese email.')
    if (!user.password) throw new BadRequestException('Esta cuenta usa Google. Inicia sesión con Google.')

    const token = crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpiry: expiry },
    })

    await this.mail.sendPasswordReset(user.email, user.name, token)

    return { message: 'Te hemos enviado un enlace de recuperación. Revisa tu bandeja de entrada.' }
  }

  async resetPassword(token: string, password: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gt: new Date() },
      },
    })

    if (!user) throw new BadRequestException('El enlace ha expirado o no es válido.')

    const hash = await bcrypt.hash(password, 12)

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hash, passwordResetToken: null, passwordResetExpiry: null },
    })

    return { message: 'Contraseña actualizada. Ya puedes iniciar sesión.' }
  }

  getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        location: true,
        instruments: true,
        genres: true,
        createdAt: true,
      },
    })
  }

  private buildAuthResponse(user: {
    id: string
    name: string
    email: string
    avatar: string | null
    bio: string | null
    location: string | null
    instruments: string[]
    genres: string[]
    createdAt: Date
  }) {
    const payload = { sub: user.id, email: user.email }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        instruments: user.instruments,
        genres: user.genres,
        createdAt: user.createdAt.toISOString(),
      },
      tokens: {
        accessToken: this.jwt.sign(payload),
        refreshToken: this.jwt.sign(payload, {
          secret: this.config.get('JWT_REFRESH_SECRET'),
          expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
        }),
      },
    }
  }
}
