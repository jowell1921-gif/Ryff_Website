import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

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

  app.enableCors({
    origin: true, // en desarrollo acepta cualquier origen; en producción usar CLIENT_URL
    credentials: true,
  })

  const port = process.env.PORT ?? 3000
  await app.listen(port)
  console.warn(`Backend corriendo en http://localhost:${port}/api`)
}

bootstrap()
