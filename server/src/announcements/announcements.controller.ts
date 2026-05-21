import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AnnouncementsService } from './announcements.service'
import { CreateAnnouncementDto } from './dto/create-announcement.dto'
import { CurrentUser } from '../auth/current-user.decorator'

@Controller('announcements')
@UseGuards(AuthGuard('jwt'))
export class AnnouncementsController {
  constructor(private announcementsService: AnnouncementsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('type') type?: string,
  ) {
    return this.announcementsService.findAll(search, type)
  }

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateAnnouncementDto,
  ) {
    return this.announcementsService.create(userId, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteOne(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.announcementsService.deleteOne(id, userId)
  }
}
