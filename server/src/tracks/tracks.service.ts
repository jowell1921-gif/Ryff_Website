import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CloudinaryService } from '../cloudinary/cloudinary.service'

const AUDIO_MIMES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/x-m4a', 'audio/mp4', 'audio/opus', 'audio/webm']

const trackSelect = {
  id: true,
  title: true,
  type: true,
  url: true,
  duration: true,
  coverUrl: true,
  mimeType: true,
  fileSize: true,
  createdAt: true,
  author: { select: { id: true, name: true, avatar: true } },
}

@Injectable()
export class TracksService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async upload(userId: string, buffer: Buffer, title: string, mimeType: string, fileSize: number) {
    const type = AUDIO_MIMES.includes(mimeType) ? 'AUDIO' : 'VIDEO'
    const { url, publicId, coverUrl, duration } = await this.cloudinary.uploadTrack(buffer, type)

    return this.prisma.track.create({
      data: { title, type, url, publicId, coverUrl, duration, mimeType, fileSize, authorId: userId },
      select: trackSelect,
    })
  }

  findAll() {
    return this.prisma.track.findMany({
      select: trackSelect,
      orderBy: { createdAt: 'desc' },
    })
  }

  findMine(userId: string) {
    return this.prisma.track.findMany({
      where: { authorId: userId },
      select: trackSelect,
      orderBy: { createdAt: 'desc' },
    })
  }

  async deleteOne(id: string, userId: string) {
    const track = await this.prisma.track.findUnique({ where: { id } })
    if (!track) throw new NotFoundException('Track no encontrado')
    if (track.authorId !== userId) throw new ForbiddenException()
    await this.prisma.track.delete({ where: { id } })
    return { success: true }
  }
}
