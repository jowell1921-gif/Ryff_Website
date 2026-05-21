import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateAnnouncementDto } from './dto/create-announcement.dto'

const announcementSelect = {
  id: true,
  title: true,
  description: true,
  type: true,
  instruments: true,
  genres: true,
  location: true,
  createdAt: true,
  author: { select: { id: true, name: true, avatar: true, location: true } },
}

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async create(authorId: string, dto: CreateAnnouncementDto) {
    return this.prisma.announcement.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        instruments: dto.instruments ?? [],
        genres: dto.genres ?? [],
        location: dto.location,
        authorId,
      },
      select: announcementSelect,
    })
  }

  async findAll(search?: string, type?: string) {
    return this.prisma.announcement.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { description: { contains: search, mode: 'insensitive' as const } },
            ],
          } : {},
          type ? { type: type as any } : {},
        ],
      },
      select: announcementSelect,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  async deleteOne(id: string, userId: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      select: { authorId: true },
    })
    if (!announcement) throw new NotFoundException('Anuncio no encontrado')
    if (announcement.authorId !== userId) throw new ForbiddenException()

    await this.prisma.announcement.delete({ where: { id } })
    return { success: true }
  }
}
