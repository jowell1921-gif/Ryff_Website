import { Controller, Get, Post, Body, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { PostsService } from './posts.service'
import { CreatePostDto } from './dto/create-post.dto'
import { CurrentUser } from '../auth/current-user.decorator'

@Controller('posts')
@UseGuards(AuthGuard('jwt'))
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.create(userId, dto)
  }

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.postsService.findAll(page)
  }
}
