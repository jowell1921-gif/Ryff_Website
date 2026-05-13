import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateConversation(userId1: string, userId2: string) {
    // Busca una conversación donde AMBOS usuarios sean participantes
    const existing = await this.prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: userId1 } } },
          { participants: { some: { id: userId2 } } },
        ],
      },
      include: {
        participants: { select: { id: true, name: true, avatar: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { id: true, content: true, senderId: true, createdAt: true },
        },
      },
    })

    if (existing) return existing

    return this.prisma.conversation.create({
      data: {
        participants: { connect: [{ id: userId1 }, { id: userId2 }] },
      },
      include: {
        participants: { select: { id: true, name: true, avatar: true } },
        messages: { take: 0 },
      },
    })
  }

  async getUserConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { participants: { some: { id: userId } } },
      include: {
        participants: { select: { id: true, name: true, avatar: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: { id: true, content: true, senderId: true, createdAt: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async getMessages(conversationId: string, userId: string) {
    // Verifica que el usuario es participante
    const conv = await this.prisma.conversation.findFirst({
      where: { id: conversationId, participants: { some: { id: userId } } },
    })
    if (!conv) throw new NotFoundException('Conversación no encontrada')

    return this.prisma.message.findMany({
      where: { conversationId },
      select: {
        id: true,
        content: true,
        senderId: true,
        conversationId: true,
        createdAt: true,
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    })
  }

  async saveMessage(conversationId: string, senderId: string, content: string) {
    const [message, conversation] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: { content, senderId, conversationId },
        select: {
          id: true,
          content: true,
          senderId: true,
          conversationId: true,
          createdAt: true,
          sender: { select: { id: true, name: true, avatar: true } },
        },
      }),
      this.prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
        // Traemos los participantes para saber a quién notificar
        select: { participants: { select: { id: true } } },
      }),
    ])

    return {
      message,
      participantIds: conversation.participants.map((p) => p.id),
    }
  }
}
