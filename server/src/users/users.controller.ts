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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { UsersService } from './users.service'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { CurrentUser } from '../auth/current-user.decorator'

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('suggestions')
  getSuggestions(@CurrentUser('sub') viewerId: string) {
    return this.usersService.getSuggestions(viewerId)
  }

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

  // Subir avatar
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: join(process.cwd(), 'uploads', 'avatars'),
      filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`
        cb(null, unique)
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.match(/^image\//)) return cb(new BadRequestException('Solo imágenes'), false)
      cb(null, true)
    },
  }))
  uploadAvatar(
    @CurrentUser('sub') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const port = process.env.PORT ?? 3000
    const avatarUrl = `http://localhost:${port}/uploads/avatars/${file.filename}`
    return this.usersService.updateAvatar(userId, avatarUrl)
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
