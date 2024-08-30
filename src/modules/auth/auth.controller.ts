import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { Login2faDto } from './dtos/login-2fa.dto';
import { LoginDto } from './dtos/login.dto';
import { ApiTags } from '@nestjs/swagger';
import { RequestPasswordResetDto } from './dtos/request-password-reset.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { Response } from 'express';
@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/register')
  register(@Body() register: RegisterDto): Promise<User> {
    return this.authService.register(register);
  }

  @Post('/login')
  login(@Body() loginData: LoginDto) {
    return this.authService.login(loginData);
  }

  @Get('confirm')
  async confirmRegistration(@Query('token') token: string) {
    return await this.authService.confirmEmail(token);
  }

  @Post('/api/User/login-2fa')
  login2fa(@Body() loginData: Login2faDto) {
    return this.authService.login2fa(loginData);
  }

  @Post('/refresh-token')
  refreshToken(@Body() token: any) {
    return this.authService.refreshToken(token.refresh_token);
  }

  @Post('request-password-reset')
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ) {
    await this.authService.requestPasswordReset(requestPasswordResetDto.email);
    return { message: 'Password reset link sent to your email' };
  }

  @Get('reset-password')
  @Render('reset-password') // Thay thế bằng tên template của bạn
  renderResetPasswordPage(@Query('token') token: string) {
    return { token }; // Truyền token vào template
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;
    try {
      return this.authService.resetPassword(token, newPassword);
    } catch (error) {
      return 'Reset password false';
    }
  }
}
