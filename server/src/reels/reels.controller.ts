import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
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

  @Post(':id/like')
  like(@CurrentUser('sub') userId: string, @Param('id') reelId: string) {
    return this.reelsService.toggleLike(reelId, userId, true)
  }

  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  unlike(@CurrentUser('sub') userId: string, @Param('id') reelId: string) {
    return this.reelsService.toggleLike(reelId, userId, false)
  }
}
