import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { NotificationsService } from '../notifications/notifications.service'

const commentSelect = {
  id: true,
  content: true,
  createdAt: true,
  author: { select: { id: true, name: true, avatar: true } },
}

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(postId: string, authorId: string, content: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    })
    if (!post) throw new NotFoundException('Post no encontrado')

    const comment = await this.prisma.comment.create({
      data: { content, authorId, postId },
      select: commentSelect,
    })

    // Notificar al autor del post (si no es el mismo que comenta)
    await this.notifications.create('POST_COMMENT', authorId, post.authorId, postId)

    return comment
  }

  async findByPost(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      select: commentSelect,
      orderBy: { createdAt: 'asc' },
    })
  }

  async delete(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    })
    if (!comment) throw new NotFoundException('Comentario no encontrado')
    if (comment.authorId !== userId) throw new ForbiddenException('No puedes borrar este comentario')

    await this.prisma.comment.delete({ where: { id: commentId } })
    return { success: true }
  }
}
