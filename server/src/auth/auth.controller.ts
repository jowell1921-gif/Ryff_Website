import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus, Req, Res } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import type { Response } from 'express'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { CurrentUser } from './current-user.decorator'

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private config: ConfigService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMe(@CurrentUser('sub') userId: string) {
    return this.authService.getMe(userId)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout() {
    return { message: 'Sesión cerrada correctamente' }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: any, @Res() res: Response) {
    console.log('[Google Callback] req.user:', req.user)
    const encoded = encodeURIComponent(JSON.stringify(req.user))
    const clientUrl = this.config.get('CLIENT_URL')
    console.log('[Google Callback] redirecting to:', `${clientUrl}/auth/google/callback?data=${encoded?.slice(0, 50)}`)
    res.redirect(`${clientUrl}/auth/google/callback?data=${encoded}`)
  }
}
