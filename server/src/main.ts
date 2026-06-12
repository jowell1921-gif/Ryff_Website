import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' })

  // IoAdapter conecta Socket.io al mismo servidor HTTP — comparten el puerto 3000
  app.useWebSocketAdapter(new IoAdapter(app))
  app.setGlobalPrefix('api')

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
  ].filter(Boolean)

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  })

  const port = process.env.PORT ?? 3000
  await app.listen(port)
  console.warn(`Backend corriendo en http://localhost:${port}/api`)
}

bootstrap()
