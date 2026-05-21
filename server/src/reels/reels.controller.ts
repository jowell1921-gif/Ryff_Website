import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { ReactionType } from '@prisma/client'
import { ReelsService } from './reels.service'
import { CurrentUser } from '../auth/current-user.decorator'

@Controller('reels')
@UseGuards(AuthGuard('jwt'))
export class ReelsController {
  constructor(private reelsService: ReelsService) {}

  @Get()
  findAll(@CurrentUser('sub') userId: string) {
    return this.reelsService.findAll(userId)
  }

  @Post()
  @UseInterceptors(FileInterceptor('video', { storage: memoryStorage() }))
  upload(
    @CurrentUser('sub') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('caption') caption?: string,
  ) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo')
    return this.reelsService.upload(userId, file.buffer, caption)
  }

  @Post(':id/react')
  react(
    @CurrentUser('sub') userId: string,
    @Param('id') reelId: string,
    @Body('type') type: ReactionType,
  ) {
    if (!Object.values(ReactionType).includes(type)) {
      throw new BadRequestException('Tipo de reacción inválido')
    }
    return this.reelsService.toggleReaction(reelId, userId, type)
  }

  @Get(':id/comments')
  getComments(@Param('id') reelId: string) {
    return this.reelsService.getComments(reelId)
  }

  @Post(':id/comments')
  addComment(
    @CurrentUser('sub') userId: string,
    @Param('id') reelId: string,
    @Body('content') content: string,
  ) {
    if (!content?.trim()) throw new BadRequestException('El comentario no puede estar vacío')
    return this.reelsService.addComment(reelId, userId, content.trim())
  }

  @Delete(':id/comments/:commentId')
  deleteComment(
    @CurrentUser('sub') userId: string,
    @Param('commentId') commentId: string,
  ) {
    return this.reelsService.deleteComment(commentId, userId)
  }
}
