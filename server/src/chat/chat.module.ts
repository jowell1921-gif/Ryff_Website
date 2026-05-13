import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PrismaModule } from '../prisma/prisma.module'
import { ChatService } from './chat.service'
import { ChatGateway } from './chat.gateway'
import { ChatController } from './chat.controller'

@Module({
  imports: [
    PrismaModule,
    // ChatGateway necesita JwtService para verificar tokens en la conexión WebSocket
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule {}
