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
import { TracksService } from './tracks.service'
import { CreateTrackDto } from './dto/create-track.dto'
import { CurrentUser } from '../auth/current-user.decorator'

const MAX_SIZE = 200 * 1024 * 1024 // 200 MB

@Controller('tracks')
@UseGuards(AuthGuard('jwt'))
export class TracksController {
  constructor(private tracksService: TracksService) {}

  @Get()
  findAll() {
    return this.tracksService.findAll()
  }

  @Get('mine')
  findMine(@CurrentUser('sub') userId: string) {
    return this.tracksService.findMine(userId)
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
}
