import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ChatService } from './chat.service'
import { CurrentUser } from '../auth/current-user.decorator'

@Controller('conversations')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private chatService: ChatService) {}

  // Lista de conversaciones del usuario logueado
  @Get()
  getConversations(@CurrentUser('sub') userId: string) {
    return this.chatService.getUserConversations(userId)
  }

  // Crear o recuperar conversación con otro usuario
  @Post()
  @HttpCode(HttpStatus.OK)
  getOrCreate(
    @CurrentUser('sub') userId: string,
    @Body('targetUserId') targetUserId: string,
  ) {
    return this.chatService.getOrCreateConversation(userId, targetUserId)
  }

  // Historial de mensajes de una conversación
  @Get(':id/messages')
  getMessages(
    @Param('id') conversationId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.chatService.getMessages(conversationId, userId)
  }
}
