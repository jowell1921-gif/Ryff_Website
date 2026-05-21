import { Controller, Get, Patch, Delete, Param, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { NotificationsService } from './notifications.service'
import { CurrentUser } from '../auth/current-user.decorator'

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  findAll(@CurrentUser('sub') userId: string) {
    return this.notificationsService.findAll(userId)
  }

  @Get('unread-count')
  countUnread(@CurrentUser('sub') userId: string) {
    return this.notificationsService.countUnread(userId)
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser('sub') userId: string) {
    return this.notificationsService.markAllAsRead(userId)
  }

  @Delete('all')
  deleteAll(@CurrentUser('sub') userId: string) {
    return this.notificationsService.deleteAll(userId)
  }

  @Delete(':id')
  deleteOne(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.notificationsService.deleteOne(id, userId)
  }
}
