import {
  Controller, Get, Post, Delete, Body, Param, Query,
  UseGuards, ParseIntPipe, DefaultValuePipe,
  UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { PostsService } from './posts.service'
import { CreatePostDto } from './dto/create-post.dto'
import { ReactPostDto } from './dto/react-post.dto'
import { CurrentUser } from '../auth/current-user.decorator'
import { CloudinaryService } from '../cloudinary/cloudinary.service'

@Controller('posts')
@UseGuards(AuthGuard('jwt'))
export class PostsController {
  constructor(
    private postsService: PostsService,
    private cloudinary: CloudinaryService,
  ) {}

  @Post()
  create(@CurrentUser('sub') userId: string, @Body() dto: CreatePostDto) {
    return this.postsService.create(userId, dto)
  }

  @Post('upload-media')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadMedia(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se recibió ningún archivo')
    const mime = file.mimetype
    const isValid = mime.startsWith('image/') || mime.startsWith('video/') || mime.startsWith('audio/')
    if (!isValid) throw new BadRequestException('Tipo de archivo no permitido')
    const { url } = await this.cloudinary.uploadPostMedia(file.buffer, mime)
    let mediaType: string
    if (mime.startsWith('image/')) mediaType = 'IMAGE'
    else if (mime.startsWith('audio/')) mediaType = 'AUDIO'
    else mediaType = 'VIDEO'
    return { url, mediaType }
  }

  // Must be before /:id routes to avoid NestJS interpreting 'reposts' as a param
  @Get('reposts/feed')
  getRepostsFeed(@CurrentUser('sub') viewerId: string) {
    return this.postsService.getRepostsFeed(viewerId)
  }

  @Get('reposts/user/:userId')
  getUserReposts(
    @Param('userId') userId: string,
    @CurrentUser('sub') viewerId: string,
  ) {
    return this.postsService.getUserReposts(userId, viewerId)
  }

  @Get()
  findAll(
    @CurrentUser('sub') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.postsService.findAll(userId, page)
  }

  @Delete(':id')
  delete(@CurrentUser('sub') userId: string, @Param('id') postId: string) {
    return this.postsService.delete(postId, userId)
  }

  @Post(':id/repost')
  repost(
    @CurrentUser('sub') userId: string,
    @Param('id') postId: string,
    @Body('comment') comment?: string,
  ) {
    return this.postsService.toggleRepost(postId, userId, comment)
  }

  @Post(':id/react')
  react(
    @CurrentUser('sub') userId: string,
    @Param('id') postId: string,
    @Body() dto: ReactPostDto,
  ) {
    return this.postsService.toggleReact(postId, userId, dto.type)
  }
}
