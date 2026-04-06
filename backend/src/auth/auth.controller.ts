import { Controller, Post, Body, Res, HttpCode, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

const COOKIE_OPTIONS = {
  httpOnly: true,       // JavaScript CANNOT read this cookie → XSS immune
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
  sameSite: 'lax' as const,   // CSRF protection
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(body);

    // Set HttpOnly cookie with the JWT
    res.cookie('accessToken', result.accessToken, COOKIE_OPTIONS);

    // Also set orgId as HttpOnly cookie
    if (result.user.organizations?.length > 0) {
      res.cookie('orgId', result.user.organizations[0].orgId, COOKIE_OPTIONS);
    }

    // Return user info only — NO token in response body
    return { user: result.user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(body);

    // Set HttpOnly cookie with the JWT
    res.cookie('accessToken', result.accessToken, COOKIE_OPTIONS);

    // Also set orgId as HttpOnly cookie
    if (result.user.organizations?.length > 0) {
      res.cookie('orgId', result.user.organizations[0].orgId, COOKIE_OPTIONS);
    }

    // Return user info only — NO token in response body
    return { user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('orgId', { path: '/' });
    return { message: 'Sesión cerrada correctamente' };
  }
}
