import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { PostsService } from './posts.service'
import { CreatePostDto } from './dto/create-post.dto'
import { ReactPostDto } from './dto/react-post.dto'
import { CurrentUser } from '../auth/current-user.decorator'

@Controller('posts')
@UseGuards(AuthGuard('jwt'))
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  create(@CurrentUser('sub') userId: string, @Body() dto: CreatePostDto) {
    return this.postsService.create(userId, dto)
  }

  @Get()
  findAll(
    @CurrentUser('sub') userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.postsService.findAll(userId, page)
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
