import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
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

    const passwordValid = await bcrypt.compare(dto.password, user.password)
    if (!passwordValid) throw new UnauthorizedException('Credenciales incorrectas')

    return this.buildAuthResponse(user)
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
