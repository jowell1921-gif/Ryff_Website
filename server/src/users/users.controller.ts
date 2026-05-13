import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { UsersService } from './users.service'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { CurrentUser } from '../auth/current-user.decorator'

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Buscar músicos — GET /users?search=&instrument=&genre=
  // Debe ir ANTES que :id para que NestJS no lo confunda con un parámetro
  @Get()
  searchUsers(
    @CurrentUser('sub') viewerId: string,
    @Query('search') search?: string,
    @Query('instrument') instrument?: string,
    @Query('genre') genre?: string,
  ) {
    return this.usersService.searchUsers(viewerId, search, instrument, genre)
  }

  // Perfil propio
  @Get('me')
  getMe(@CurrentUser('sub') userId: string) {
    return this.usersService.findById(userId)
  }

  // Actualizar perfil propio
  @Patch('me')
  updateMe(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, dto)
  }

  // Perfil público — incluye isFollowing para el viewer
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('sub') viewerId: string,
  ) {
    return this.usersService.findById(id, viewerId)
  }

  // Posts de un usuario
  @Get(':id/posts')
  getUserPosts(@Param('id') id: string) {
    return this.usersService.getUserPosts(id)
  }

  // Seguir
  @Post(':id/follow')
  @HttpCode(HttpStatus.OK)
  follow(
    @Param('id') followingId: string,
    @CurrentUser('sub') followerId: string,
  ) {
    return this.usersService.followUser(followerId, followingId)
  }

  // Dejar de seguir
  @Delete(':id/follow')
  @HttpCode(HttpStatus.OK)
  unfollow(
    @Param('id') followingId: string,
    @CurrentUser('sub') followerId: string,
  ) {
    return this.usersService.unfollowUser(followerId, followingId)
  }
}
