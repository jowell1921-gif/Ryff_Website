import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { ReactionType } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CloudinaryService } from '../cloudinary/cloudinary.service'

const AUDIO_MIMES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/aac', 'audio/x-m4a', 'audio/mp4', 'audio/opus', 'audio/webm']

const trackCommentSelect = {
  id: true,
  content: true,
  createdAt: true,
  author: { select: { id: true, name: true, avatar: true } },
}

function makeTrackSelect() {
  return {
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
    likes: { select: { type: true, userId: true } },
    _count: { select: { comments: true } },
  }
}

function formatTrack(track: any, viewerId?: string) {
  const { likes = [], _count, ...rest } = track
  return {
    ...rest,
    clapCount:     likes.filter((l: any) => l.type === 'APLAUSO').length,
    fireCount:     likes.filter((l: any) => l.type === 'FIRE').length,
    asombraCount:  likes.filter((l: any) => l.type === 'ASOMBRA').length,
    isClapped:  viewerId ? likes.some((l: any) => l.type === 'APLAUSO' && l.userId === viewerId) : false,
    isFired:    viewerId ? likes.some((l: any) => l.type === 'FIRE'    && l.userId === viewerId) : false,
    isAsombra:  viewerId ? likes.some((l: any) => l.type === 'ASOMBRA' && l.userId === viewerId) : false,
    commentsCount: _count?.comments ?? 0,
  }
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

    const track = await this.prisma.track.create({
      data: { title, type, url, publicId, coverUrl, duration, mimeType, fileSize, authorId: userId },
      select: makeTrackSelect(),
    })
    return formatTrack(track, userId)
  }

  async findAll(viewerId: string) {
    const tracks = await this.prisma.track.findMany({
      select: makeTrackSelect(),
      orderBy: { createdAt: 'desc' },
    })
    return tracks.map((t) => formatTrack(t, viewerId))
  }

  async findMine(userId: string) {
    const tracks = await this.prisma.track.findMany({
      where: { authorId: userId },
      select: makeTrackSelect(),
      orderBy: { createdAt: 'desc' },
    })
    return tracks.map((t) => formatTrack(t, userId))
  }

  async findByUser(authorId: string, viewerId: string) {
    const tracks = await this.prisma.track.findMany({
      where: { authorId },
      select: makeTrackSelect(),
      orderBy: { createdAt: 'desc' },
    })
    return tracks.map((t) => formatTrack(t, viewerId))
  }

  async toggleReact(trackId: string, userId: string, type: ReactionType) {
    const existing = await this.prisma.trackLike.findUnique({
      where: { userId_trackId_type: { userId, trackId, type } },
    })

    if (existing) {
      await this.prisma.trackLike.delete({ where: { userId_trackId_type: { userId, trackId, type } } })
    } else {
      await this.prisma.trackLike.create({ data: { userId, trackId, type } })
    }

    const likes = await this.prisma.trackLike.findMany({ where: { trackId }, select: { type: true, userId: true } })
    return {
      clapCount:    likes.filter((l) => l.type === 'APLAUSO').length,
      fireCount:    likes.filter((l) => l.type === 'FIRE').length,
      asombraCount: likes.filter((l) => l.type === 'ASOMBRA').length,
      isClapped:  likes.some((l) => l.type === 'APLAUSO' && l.userId === userId),
      isFired:    likes.some((l) => l.type === 'FIRE'    && l.userId === userId),
      isAsombra:  likes.some((l) => l.type === 'ASOMBRA' && l.userId === userId),
    }
  }

  async deleteOne(id: string, userId: string) {
    const track = await this.prisma.track.findUnique({ where: { id } })
    if (!track) throw new NotFoundException('Track no encontrado')
    if (track.authorId !== userId) throw new ForbiddenException()
    await this.prisma.track.delete({ where: { id } })
    return { success: true }
  }

  async getTrackComments(trackId: string) {
    return this.prisma.trackComment.findMany({
      where: { trackId },
      select: trackCommentSelect,
      orderBy: { createdAt: 'asc' },
    })
  }

  async addTrackComment(trackId: string, authorId: string, content: string) {
    return this.prisma.trackComment.create({
      data: { content, authorId, trackId },
      select: trackCommentSelect,
    })
  }

  async deleteTrackComment(commentId: string, userId: string) {
    const c = await this.prisma.trackComment.findUnique({ where: { id: commentId } })
    if (!c) throw new NotFoundException('Comentario no encontrado')
    if (c.authorId !== userId) throw new ForbiddenException()
    await this.prisma.trackComment.delete({ where: { id: commentId } })
    return { success: true }
  }
}
