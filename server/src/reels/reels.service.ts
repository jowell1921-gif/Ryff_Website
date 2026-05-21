import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CloudinaryService } from '../cloudinary/cloudinary.service'
import { NotificationsService } from '../notifications/notifications.service'
import { ReactionType } from '@prisma/client'

const commentSelect = {
  id: true,
  content: true,
  createdAt: true,
  author: { select: { id: true, name: true, avatar: true } },
}

@Injectable()
export class ReelsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private notifications: NotificationsService,
  ) {}

  async upload(userId: string, buffer: Buffer, caption?: string) {
    const { url, publicId, thumbnailUrl } = await this.cloudinary.uploadVideo(buffer)
    return this.prisma.reel.create({
      data: { videoUrl: url, thumbnailUrl, publicId, caption, authorId: userId },
      select: { id: true, videoUrl: true, thumbnailUrl: true, caption: true, createdAt: true, author: { select: { id: true, name: true, avatar: true } } },
    })
  }

  async findAll(viewerId: string) {
    const reels = await this.prisma.reel.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        videoUrl: true,
        thumbnailUrl: true,
        caption: true,
        createdAt: true,
        author: { select: { id: true, name: true, avatar: true } },
        likes: { select: { userId: true, type: true } },
        _count: { select: { reelComments: true } },
      },
    })

    return reels.map(({ likes, _count, ...r }) => ({
      ...r,
      clapCount:    likes.filter((l) => l.type === 'APLAUSO').length,
      fireCount:    likes.filter((l) => l.type === 'FIRE').length,
      asombraCount: likes.filter((l) => l.type === 'ASOMBRA').length,
      isClapped:    likes.some((l) => l.userId === viewerId && l.type === 'APLAUSO'),
      isFired:      likes.some((l) => l.userId === viewerId && l.type === 'FIRE'),
      isAsombra:    likes.some((l) => l.userId === viewerId && l.type === 'ASOMBRA'),
      commentCount: _count.reelComments,
    }))
  }

  async toggleReaction(reelId: string, userId: string, type: ReactionType) {
    const existing = await this.prisma.reelLike.findUnique({
      where: { userId_reelId_type: { userId, reelId, type } },
    })

    if (existing) {
      await this.prisma.reelLike.delete({ where: { userId_reelId_type: { userId, reelId, type } } })
    } else {
      await this.prisma.reelLike.create({ data: { userId, reelId, type } })

      const reel = await this.prisma.reel.findUnique({
        where: { id: reelId },
        select: { authorId: true },
      })
      if (reel) {
        await this.notifications.create('REEL_LIKE', userId, reel.authorId, undefined, undefined, type, reelId)
      }
    }

    const likes = await this.prisma.reelLike.findMany({ where: { reelId }, select: { userId: true, type: true } })
    return {
      clapCount:    likes.filter((l) => l.type === 'APLAUSO').length,
      fireCount:    likes.filter((l) => l.type === 'FIRE').length,
      asombraCount: likes.filter((l) => l.type === 'ASOMBRA').length,
      isClapped:    likes.some((l) => l.userId === userId && l.type === 'APLAUSO'),
      isFired:      likes.some((l) => l.userId === userId && l.type === 'FIRE'),
      isAsombra:    likes.some((l) => l.userId === userId && l.type === 'ASOMBRA'),
    }
  }

  async getComments(reelId: string) {
    return this.prisma.reelComment.findMany({
      where: { reelId },
      select: commentSelect,
      orderBy: { createdAt: 'asc' },
    })
  }

  async addComment(reelId: string, userId: string, content: string) {
    const comment = await this.prisma.reelComment.create({
      data: { content, authorId: userId, reelId },
      select: commentSelect,
    })

    const reel = await this.prisma.reel.findUnique({
      where: { id: reelId },
      select: { authorId: true },
    })
    if (reel) {
      await this.notifications.create('REEL_COMMENT', userId, reel.authorId, undefined, undefined, undefined, reelId)
    }

    return comment
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.reelComment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    })
    if (!comment || comment.authorId !== userId) throw new ForbiddenException()
    await this.prisma.reelComment.delete({ where: { id: commentId } })
    return { success: true }
  }
}
