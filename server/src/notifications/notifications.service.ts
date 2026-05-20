import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { ChatGateway } from '../chat/chat.gateway'
import { NotificationType } from '@prisma/client'

const notificationSelect = {
  id: true,
  type: true,
  read: true,
  createdAt: true,
  from: { select: { id: true, name: true, avatar: true } },
  post: { select: { id: true, content: true } },
}

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private gateway: ChatGateway,
  ) {}

  async create(type: NotificationType, fromUserId: string, toUserId: string, postId?: string) {
    // No notificarse a uno mismo
    if (fromUserId === toUserId) return

    const notification = await this.prisma.notification.create({
      data: { type, fromUserId, toUserId, postId },
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
}
