import { Injectable } from '@nestjs/common'
import { ReactionType } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePostDto } from './dto/create-post.dto'
import { NotificationsService } from '../notifications/notifications.service'

const postSelect = {
  id: true,
  content: true,
  mediaUrl: true,
  createdAt: true,
  author: {
    select: { id: true, name: true, avatar: true, instruments: true },
  },
  _count: { select: { comments: true } },
  likes: {
    select: { type: true, userId: true },
  },
}

function formatPost(post: any, viewerId?: string) {
  const { likes = [], _count, ...rest } = post
  return {
    ...rest,
    commentsCount: _count?.comments ?? 0,
    clapCount:    likes.filter((l: any) => l.type === 'APLAUSO').length,
    fireCount:    likes.filter((l: any) => l.type === 'FIRE').length,
    asombraCount: likes.filter((l: any) => l.type === 'ASOMBRA').length,
    isClapped:  viewerId ? likes.some((l: any) => l.type === 'APLAUSO' && l.userId === viewerId) : false,
    isFired:    viewerId ? likes.some((l: any) => l.type === 'FIRE'    && l.userId === viewerId) : false,
    isAsombra:  viewerId ? likes.some((l: any) => l.type === 'ASOMBRA' && l.userId === viewerId) : false,
  }
}

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(authorId: string, dto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: { content: dto.content, mediaUrl: dto.mediaUrl, authorId },
      select: postSelect,
    })
    return formatPost(post)
  }

  async findAll(viewerId: string, page = 1) {
    const limit = 20
    const skip = (page - 1) * limit

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        select: postSelect,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      this.prisma.post.count(),
    ])

    return {
      posts: posts.map((p) => formatPost(p, viewerId)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + posts.length < total,
    }
  }

  async toggleReact(postId: string, userId: string, type: ReactionType) {
    const existing = await this.prisma.postLike.findUnique({
      where: { userId_postId_type: { userId, postId, type } },
    })

    if (existing) {
      await this.prisma.postLike.delete({
        where: { userId_postId_type: { userId, postId, type } },
      })
    } else {
      await this.prisma.postLike.create({ data: { userId, postId, type } })
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true },
      })
      if (post) {
        await this.notifications.create('POST_LIKE', userId, post.authorId, postId)
      }
    }

    const likes = await this.prisma.postLike.findMany({
      where: { postId },
      select: { type: true, userId: true },
    })

    return {
      clapCount:    likes.filter((l) => l.type === 'APLAUSO').length,
      fireCount:    likes.filter((l) => l.type === 'FIRE').length,
      asombraCount: likes.filter((l) => l.type === 'ASOMBRA').length,
      isClapped:  likes.some((l) => l.type === 'APLAUSO' && l.userId === userId),
      isFired:    likes.some((l) => l.type === 'FIRE'    && l.userId === userId),
      isAsombra:  likes.some((l) => l.type === 'ASOMBRA' && l.userId === userId),
    }
  }
}
