import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { PostsModule } from './posts/posts.module'
import { UsersModule } from './users/users.module'
import { ChatModule } from './chat/chat.module'
import { BandsModule } from './bands/bands.module'
import { CloudinaryModule } from './cloudinary/cloudinary.module'
import { ReelsModule } from './reels/reels.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PostsModule,
    UsersModule,
    ChatModule,
    BandsModule,
    CloudinaryModule,
    ReelsModule,
  ],
})
export class AppModule {}
