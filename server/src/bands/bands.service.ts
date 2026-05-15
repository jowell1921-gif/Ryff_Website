import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateBandDto } from './dto/create-band.dto'

const bandSelect = {
  id: true,
  name: true,
  description: true,
  genres: true,
  location: true,
  avatar: true,
  banner: true,
  lookingFor: true,
  createdAt: true,
  members: {
    select: {
      id: true,
      role: true,
      instrument: true,
      joinedAt: true,
      userId: true,
      user: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { role: 'asc' as const },
  },
  _count: { select: { members: true } },
}

@Injectable()
export class BandsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBandDto) {
    return this.prisma.band.create({
      data: {
        name: dto.name,
        description: dto.description,
        genres: dto.genres ?? [],
        location: dto.location,
        lookingFor: dto.lookingFor ?? [],
        members: {
          create: {
            userId,
            role: 'ADMIN',
            instrument: dto.creatorInstrument,
          },
        },
      },
      select: bandSelect,
    })
  }

  async findAll(search?: string, genre?: string) {
    return this.prisma.band.findMany({
      where: {
        AND: [
          search ? { name: { contains: search, mode: 'insensitive' as const } } : {},
          genre ? { genres: { has: genre } } : {},
        ],
      },
      select: bandSelect,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findById(id: string) {
    const band = await this.prisma.band.findUnique({
      where: { id },
      select: bandSelect,
    })
    if (!band) throw new NotFoundException('Banda no encontrada')
    return band
  }

  async join(bandId: string, userId: string) {
    await this.findById(bandId)
    return this.prisma.bandMember.upsert({
      where: { userId_bandId: { userId, bandId } },
      create: { userId, bandId, role: 'MEMBER' },
      update: {},
      select: { id: true, role: true, userId: true, bandId: true },
    })
  }

  async leave(bandId: string, userId: string) {
    const member = await this.prisma.bandMember.findUnique({
      where: { userId_bandId: { userId, bandId } },
    })
    if (!member) return

    const memberCount = await this.prisma.bandMember.count({ where: { bandId } })

    if (memberCount === 1) {
      // Último miembro — elimina la banda
      await this.prisma.band.delete({ where: { id: bandId } })
      return { deleted: true }
    }

    if (member.role === 'ADMIN') {
      const adminCount = await this.prisma.bandMember.count({
        where: { bandId, role: 'ADMIN' },
      })
      if (adminCount === 1) {
        // Transfiere admin al miembro más antiguo
        const nextMember = await this.prisma.bandMember.findFirst({
          where: { bandId, NOT: { userId } },
          orderBy: { joinedAt: 'asc' },
        })
        if (nextMember) {
          await this.prisma.bandMember.update({
            where: { id: nextMember.id },
            data: { role: 'ADMIN' },
          })
        }
      }
    }

    await this.prisma.bandMember.delete({
      where: { userId_bandId: { userId, bandId } },
    })
    return { left: true }
  }
}
