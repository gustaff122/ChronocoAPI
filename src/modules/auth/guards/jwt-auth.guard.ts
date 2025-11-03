import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  public override async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: any }>();
    const response = context.switchToHttp().getResponse<Response>();

    const result = (await super.canActivate(context)) as boolean;
    const token = (request as any)?.cookies?.['access_token'];
    if (token) {
      response.cookie('access_token', token, {
        httpOnly: true,
        secure: process.env['HTTPS_COOKIES_SECURE'] === 'true',
        sameSite: 'lax',
        maxAge: 1000 * 60 * 30,
      });
    }
    return result;
  }
}
