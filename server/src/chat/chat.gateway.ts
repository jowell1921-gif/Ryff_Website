import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { ChatService } from './chat.service'

interface SendMessagePayload {
  conversationId: string
  content: string
}

interface TypingPayload {
  conversationId: string
  isTyping: boolean
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  // Mapa userId → socketId para saber quién está online
  private onlineUsers = new Map<string, string>()

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string
      if (!token) return client.disconnect()

      const payload = this.jwtService.verify<{ sub: string }>(token)
      client.data.userId = payload.sub
      this.onlineUsers.set(payload.sub, client.id)

      // Cada usuario entra automáticamente a su room personal
      // Así recibe mensajes sin importar qué página esté viendo
      client.join(`user:${payload.sub}`)
    } catch {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId as string
    if (userId) this.onlineUsers.delete(userId)
  }

  // El cliente llama a joinConversation cuando abre un chat
  @SubscribeMessage('joinConversation')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.join(conversationId)
    return { success: true }
  }

  @SubscribeMessage('leaveConversation')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: string,
  ) {
    client.leave(conversationId)
  }

  // Mensaje entrante: guarda en DB y emite a todos en la room
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessagePayload,
  ) {
    const { conversationId, content } = payload
    const senderId = client.data.userId as string
    if (!content?.trim()) return

    const { message, participantIds } = await this.chatService.saveMessage(
      conversationId,
      senderId,
      content.trim(),
    )

    // 1. Emite a la room de la conversación (para quien la tenga abierta)
    this.server.to(conversationId).emit('newMessage', message)

    // 2. Emite a la room personal de cada participante (para notificaciones)
    //    Así llega aunque el destinatario esté en otra página
    for (const participantId of participantIds) {
      this.server.to(`user:${participantId}`).emit('newMessage', message)
    }

    return message
  }

  // Indicador de escritura: retransmite a los demás en la room
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingPayload,
  ) {
    // client.to() excluye al remitente — solo avisamos a los otros
    client.to(payload.conversationId).emit('typing', {
      userId: client.data.userId,
      isTyping: payload.isTyping,
    })
  }

  isOnline(userId: string): boolean {
    return this.onlineUsers.has(userId)
  }
}
