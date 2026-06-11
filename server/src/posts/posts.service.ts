import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common'
import { ReactionType } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePostDto } from './dto/create-post.dto'
import { NotificationsService } from '../notifications/notifications.service'

function makePostSelect(viewerId: string) {
  return {
    id: true,
    content: true,
    mediaUrl: true,
    mediaName: true,
    mediaType: true,
    createdAt: true,
    author: { select: { id: true, name: true, avatar: true, instruments: true, role: true } },
    _count: { select: { comments: true, reposts: true } },
    likes: { select: { type: true, userId: true } },
    reposts: { where: { userId: viewerId }, select: { userId: true }, take: 1 },
  }
}

function formatPost(post: any, viewerId?: string) {
  const { likes = [], reposts = [], _count, ...rest } = post
  return {
    ...rest,
    commentsCount: _count?.comments ?? 0,
    repostCount:   _count?.reposts  ?? 0,
    isReposted:    reposts.length > 0,
    clapCount:    likes.filter((l: any) => l.type === 'APLAUSO').length,
    fireCount:    likes.filter((l: any) => l.type === 'FIRE').length,
    asombraCount: likes.filter((l: any) => l.type === 'ASOMBRA').length,
    isClapped:  viewerId ? likes.some((l: any) => l.type === 'APLAUSO' && l.userId === viewerId) : false,
    isFired:    viewerId ? likes.some((l: any) => l.type === 'FIRE'    && l.userId === viewerId) : false,
    isAsombra:  viewerId ? likes.some((l: any) => l.type === 'ASOMBRA' && l.userId === viewerId) : false,
  }
}

const repostSelect = (viewerId: string) => ({
  id: true,
  comment: true,
  createdAt: true,
  user: { select: { id: true, name: true, avatar: true, role: true } },
  post: { select: makePostSelect(viewerId) },
})

function formatRepost(repost: any, viewerId: string) {
  const { user, post, ...r } = repost
  return { ...r, itemType: 'repost' as const, repostedBy: user, post: formatPost(post, viewerId) }
}

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(authorId: string, dto: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: { content: dto.content, mediaUrl: dto.mediaUrl, mediaName: dto.mediaName, mediaType: dto.mediaType, authorId },
      select: makePostSelect(authorId),
    })
    return formatPost(post, authorId)
  }

  async findAll(viewerId: string, page = 1) {
    const limit = 20
    const skip = (page - 1) * limit

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        select: makePostSelect(viewerId),
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

  async delete(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } })
    if (!post) throw new NotFoundException()
    if (post.authorId !== userId) throw new ForbiddenException()
    await this.prisma.post.delete({ where: { id: postId } })
    return { success: true }
  }

  async toggleRepost(postId: string, userId: string, comment?: string) {
    const existing = await this.prisma.repost.findUnique({
      where: { userId_postId: { userId, postId } },
    })

    if (existing) {
      await this.prisma.repost.delete({ where: { userId_postId: { userId, postId } } })
    } else {
      await this.prisma.repost.create({ data: { userId, postId, comment } })
      const post = await this.prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } })
      if (post) {
        await this.notifications.create('POST_REPOST', userId, post.authorId, postId)
      }
    }

    const count = await this.prisma.repost.count({ where: { postId } })
    return { repostCount: count, isReposted: !existing }
  }

  async getRepostsFeed(viewerId: string) {
    const reposts = await this.prisma.repost.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: repostSelect(viewerId),
    })
    return reposts.map((r) => formatRepost(r, viewerId))
  }

  async getUserReposts(userId: string, viewerId: string) {
    const reposts = await this.prisma.repost.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: repostSelect(viewerId),
    })
    return reposts.map((r) => formatRepost(r, viewerId))
  }

  async toggleReact(postId: string, userId: string, type: ReactionType) {
    const existing = await this.prisma.postLike.findUnique({
      where: { userId_postId_type: { userId, postId, type } },
    })

    if (existing) {
      await this.prisma.postLike.delete({ where: { userId_postId_type: { userId, postId, type } } })
    } else {
      await this.prisma.postLike.create({ data: { userId, postId, type } })
      const post = await this.prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } })
      if (post) {
        await this.notifications.create('POST_LIKE', userId, post.authorId, postId, undefined, type)
      }
    }

    const likes = await this.prisma.postLike.findMany({ where: { postId }, select: { type: true, userId: true } })
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
