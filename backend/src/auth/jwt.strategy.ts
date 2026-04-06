import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import type { Request } from 'express';

/**
 * JWT Strategy that reads the token from HttpOnly cookies.
 * 
 * SECURITY: The token is injected automatically by the browser via cookies.
 * JavaScript has NO access to it — immune to XSS attacks.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Primary: Read JWT from HttpOnly cookie
        (req: Request) => {
          return req?.cookies?.accessToken || null;
        },
        // Fallback: Still support Authorization header (for API clients, testing)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super_secret_jwt_development_key',
    });
  }

  async validate(payload: any) {
    // payload: { sub: userId, email: string }
    return { userId: payload.sub, email: payload.email };
  }
}
