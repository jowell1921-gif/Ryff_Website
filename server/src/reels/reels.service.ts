import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CloudinaryService } from '../cloudinary/cloudinary.service'

const reelSelect = {
  id: true,
  videoUrl: true,
  thumbnailUrl: true,
  caption: true,
  createdAt: true,
  author: { select: { id: true, name: true, avatar: true } },
  _count: { select: { likes: true } },
}

@Injectable()
export class ReelsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  async upload(userId: string, buffer: Buffer, caption?: string) {
    const { url, publicId, thumbnailUrl } = await this.cloudinary.uploadVideo(buffer)

    return this.prisma.reel.create({
      data: { videoUrl: url, thumbnailUrl, publicId, caption, authorId: userId },
      select: reelSelect,
    })
  }

  async findAll(viewerId: string) {
    const reels = await this.prisma.reel.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        ...reelSelect,
        likes: { where: { userId: viewerId }, select: { userId: true } },
      },
    })

    return reels.map(({ likes, _count, ...r }) => ({
      ...r,
      likesCount: _count.likes,
      isLiked: likes.length > 0,
    }))
  }

  async toggleLike(reelId: string, userId: string, liked: boolean) {
    if (liked) {
      await this.prisma.reelLike.upsert({
        where: { userId_reelId: { userId, reelId } },
        create: { userId, reelId },
        update: {},
      })
    } else {
      await this.prisma.reelLike.deleteMany({ where: { userId, reelId } })
    }
    const count = await this.prisma.reelLike.count({ where: { reelId } })
    return { likesCount: count, isLiked: liked }
  }
}
