import { Module } from '@nestjs/common'
import { TracksController } from './tracks.controller'
import { TracksService } from './tracks.service'
import { PrismaModule } from '../prisma/prisma.module'
import { CloudinaryModule } from '../cloudinary/cloudinary.module'

@Module({
  imports: [PrismaModule, CloudinaryModule],
  controllers: [TracksController],
  providers: [TracksService],
})
export class TracksModule {}
