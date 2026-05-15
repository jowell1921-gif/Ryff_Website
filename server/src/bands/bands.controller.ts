import {
  Controller,
  Get,
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
import { BandsService } from './bands.service'
import { CreateBandDto } from './dto/create-band.dto'
import { CurrentUser } from '../auth/current-user.decorator'

@Controller('bands')
@UseGuards(AuthGuard('jwt'))
export class BandsController {
  constructor(private bandsService: BandsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('genre') genre?: string,
  ) {
    return this.bandsService.findAll(search, genre)
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.bandsService.findById(id)
  }

  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateBandDto,
  ) {
    return this.bandsService.create(userId, dto)
  }

  @Post(':id/join')
  join(
    @CurrentUser('sub') userId: string,
    @Param('id') bandId: string,
  ) {
    return this.bandsService.join(bandId, userId)
  }

  @Delete(':id/leave')
  @HttpCode(HttpStatus.OK)
  leave(
    @CurrentUser('sub') userId: string,
    @Param('id') bandId: string,
  ) {
    return this.bandsService.leave(bandId, userId)
  }
}
