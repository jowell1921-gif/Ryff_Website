import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ChatGateway } from '../chat/chat.gateway'
import { NotificationType, ReactionType } from '@prisma/client'

const notificationSelect = {
  id: true,
  type: true,
  read: true,
  createdAt: true,
  reactionType: true,
  from: { select: { id: true, name: true, avatar: true } },
  post: { select: { id: true, content: true } },
  comment: { select: { id: true, content: true } },
  reel: { select: { id: true, caption: true } },
}

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private gateway: ChatGateway,
  ) {}

  async create(
    type: NotificationType,
    fromUserId: string,
    toUserId: string,
    postId?: string,
    commentId?: string,
    reactionType?: ReactionType,
    reelId?: string,
  ) {
    if (fromUserId === toUserId) return

    const notification = await this.prisma.notification.create({
      data: { type, fromUserId, toUserId, postId, commentId, reactionType, reelId },
      select: notificationSelect,
    })

    // Enviar en tiempo real al destinatario via Socket.io
    this.gateway.emitToUser(toUserId, 'notification', notification)

    return notification
  }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { toUserId: userId },
      select: notificationSelect,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { toUserId: userId, read: false },
      data: { read: true },
    })
    return { success: true }
  }

  async countUnread(userId: string) {
    const count = await this.prisma.notification.count({
      where: { toUserId: userId, read: false },
    })
    return { count }
  }

  async deleteOne(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      select: { toUserId: true },
    })
    if (!notification) throw new NotFoundException('Notificación no encontrada')
    if (notification.toUserId !== userId) throw new ForbiddenException()

    await this.prisma.notification.delete({ where: { id: notificationId } })
    return { success: true }
  }

  async deleteAll(userId: string) {
    await this.prisma.notification.deleteMany({ where: { toUserId: userId } })
    return { success: true }
  }
}
