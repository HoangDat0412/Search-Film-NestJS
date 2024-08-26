import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });

      request.user_data = payload;
      return true;
    } catch (error) {
      throw new HttpException(
        {
          status: 419,
          message: 'Token expired or does not exist',
        },
        419,
      );
    }
  }

  private extractToken(request: Request): string | undefined {
    const beare_token = request.headers.authorization;
    const [type, token] = beare_token ? beare_token.split(' ') : [];
    return type === 'Bearer' ? token : undefined;
  }
}
