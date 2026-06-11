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
import { IsEnum, IsString, MinLength } from 'class-validator'
import { ReactionType } from '@prisma/client'
import { TracksService } from './tracks.service'
import { CreateTrackDto } from './dto/create-track.dto'
import { CurrentUser } from '../auth/current-user.decorator'

class ReactTrackDto {
  @IsEnum(ReactionType)
  type: ReactionType
}

class CreateTrackCommentDto {
  @IsString()
  @MinLength(1)
  content: string
}

const MAX_SIZE = 200 * 1024 * 1024

@Controller('tracks')
@UseGuards(AuthGuard('jwt'))
export class TracksController {
  constructor(private tracksService: TracksService) {}

  @Get()
  findAll(@CurrentUser('sub') userId: string) {
    return this.tracksService.findAll(userId)
  }

  @Get('mine')
  findMine(@CurrentUser('sub') userId: string) {
    return this.tracksService.findMine(userId)
  }

  @Get('user/:userId')
  findByUser(@Param('userId') authorId: string, @CurrentUser('sub') viewerId: string) {
    return this.tracksService.findByUser(authorId, viewerId)
  }

  @Post(':id/react')
  react(
    @Param('id') trackId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: ReactTrackDto,
  ) {
    return this.tracksService.toggleReact(trackId, userId, dto.type)
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: MAX_SIZE } }))
  upload(
    @CurrentUser('sub') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateTrackDto,
  ) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo')
    return this.tracksService.upload(userId, file.buffer, dto.title, file.mimetype, file.size)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteOne(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.tracksService.deleteOne(id, userId)
  }

  @Get(':trackId/comments')
  getComments(@Param('trackId') trackId: string) {
    return this.tracksService.getTrackComments(trackId)
  }

  @Post(':trackId/comments')
  addComment(
    @Param('trackId') trackId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateTrackCommentDto,
  ) {
    return this.tracksService.addTrackComment(trackId, userId, dto.content)
  }

  @Delete(':trackId/comments/:commentId')
  @HttpCode(HttpStatus.OK)
  deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.tracksService.deleteTrackComment(commentId, userId)
  }
}
