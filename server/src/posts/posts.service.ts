import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreatePostDto } from './dto/create-post.dto'

// Selección reutilizable — siempre incluimos los mismos campos del autor
const postSelect = {
  id: true,
  content: true,
  mediaUrl: true,
  createdAt: true,
  author: {
    select: {
      id: true,
      name: true,
      avatar: true,
      instruments: true,
    },
  },
}

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(authorId: string, dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        content: dto.content,
        mediaUrl: dto.mediaUrl,
        authorId,
      },
      select: postSelect,
    })
  }

  async findAll(page = 1) {
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
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + posts.length < total,
    }
  }
}
