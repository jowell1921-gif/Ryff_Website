import {
  Controller, Get, Post, Delete, Body, Param,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CommentsService } from './comments.service'
import { CreateCommentDto } from './dto/create-comment.dto'
import { CurrentUser } from '../auth/current-user.decorator'

@Controller('posts/:postId/comments')
@UseGuards(AuthGuard('jwt'))
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get()
  findAll(@Param('postId') postId: string) {
    return this.commentsService.findByPost(postId)
  }

  @Post()
  create(
    @Param('postId') postId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(postId, userId, dto.content)
  }

  @Delete(':commentId')
  @HttpCode(HttpStatus.OK)
  delete(
    @Param('commentId') commentId: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.commentsService.delete(commentId, userId)
  }
}
