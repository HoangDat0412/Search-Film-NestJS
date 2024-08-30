import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

import { Login2faDto } from './dtos/login-2fa.dto';
import { LoginDto } from './dtos/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async register(userData: RegisterDto): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { email: userData.email },
    });

    if (user) {
      throw new HttpException('Email has been use', HttpStatus.BAD_REQUEST);
    }

    const salt = await bcrypt.genSalt();

    const hash = await bcrypt.hash(userData.password, salt);

    const token = await this.jwtService.signAsync(
      { email: userData.email },
      {
        secret: process.env.VERIFY_TOKEN_KEY,
      },
    );
    await this.sendConfirmationEmail(userData.email, token);
    // await this.mailerService.verifyEmail(token, userData.email);

    return await this.prismaService.user.create({
      data: { ...userData, password: hash, role: 'user', is_verify: false },
    });
  }

  private async sendConfirmationEmail(email: string, token: string) {
    const appUrl = this.configService.get<string>('APP_URL');
    const confirmUrl = `${appUrl}/api/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Confirm your email',
      template: './confirmation', // e.g., confirmation.hbs
      context: {
        confirmUrl,
      },
    });
  }

  // Method to confirm user registration
  async confirmEmail(token: string): Promise<string> {
    try {
      // Verify the token
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.VERIFY_TOKEN_KEY,
      });

      // Find the user by email
      const user = await this.prismaService.user.findUnique({
        where: { email: decoded.email },
      });

      if (!user) {
        throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
      }

      if (user.is_verify) {
        throw new HttpException(
          'Email already confirmed',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Update the user's is_verify field to true
      await this.prismaService.user.update({
        where: { email: decoded.email },
        data: { is_verify: true },
      });

      return 'Email confirmed successfully';
    } catch (error) {
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async login(loginData: LoginDto): Promise<any> {
    const user = await this.prismaService.user.findUnique({
      where: { email: loginData.email },
    });

    if (!user) {
      throw new HttpException('Email is not Exist', HttpStatus.BAD_GATEWAY);
    }

    const checkPassword = await bcrypt.compare(
      loginData.password,
      user.password,
    );

    if (!checkPassword) {
      throw new HttpException(
        'Password is not correct',
        HttpStatus.BAD_GATEWAY,
      );
    }

    if (!user.is_verify) {
      throw new HttpException('Account not activated', HttpStatus.UNAUTHORIZED);
    }

    const payload = {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    };

    // generate otp and otp_token
    if (user.is_2fa) {
      const otp = await this.generateOtp();
      const otp_token = await this.jwtService.signAsync(
        { ...payload, otp },
        {
          expiresIn: '5m',
          secret: process.env.OTP_TOKEN_KEY,
        },
      );

      // await this.mailerService.sendOtpEmail(user.email, otp);

      return { otp_token };
    }

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET_KEY,
    });

    const refresh_token = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.REFRESH_SECRET_KEY,
    });
    return {
      access_token,
      refresh_token,
    };
  }

  async login2fa(login2faData: Login2faDto): Promise<any> {
    try {
      const { otp, iat, exp, ...payload } = await this.jwtService.verifyAsync(
        login2faData.otp_token,
        {
          secret: process.env.OTP_TOKEN_KEY,
        },
      );

      if (login2faData.otp !== otp) {
        throw new HttpException('Otp is not correct', HttpStatus.BAD_REQUEST);
      }

      const access_token = await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
        secret: process.env.JWT_SECRET_KEY,
      });

      const refresh_token = await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.JWT_SECRET_KEY,
      });
      return {
        access_token,
        refresh_token,
      };
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

  async refreshToken(token: any): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.REFRESH_SECRET_KEY,
      });
      const { iat, exp, ...user } = payload;
      const access_token = await this.jwtService.signAsync(user, {
        expiresIn: '15m',
        secret: process.env.JWT_SECRET_KEY,
      });
      return {
        access_token: access_token,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 419,
          message: 'Token expired',
        },
        419,
      );
    }
  }

  async generateOtp() {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
  }

  // Request a password reset
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const token = await this.jwtService.signAsync(
      { email },
      {
        secret: this.configService.get<string>('RESET_PASSWORD_TOKEN_KEY'),
        expiresIn: '15m',
      },
    );

    const resetUrl = `${this.configService.get<string>('APP_URL')}/api/auth/reset-password?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Reset your password',
      template: './send-reset-password', // e.g., reset-password.hbs
      context: {
        resetUrl,
      },
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<string> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('RESET_PASSWORD_TOKEN_KEY'),
      });

      const user = await this.prismaService.user.findUnique({
        where: { email: decoded.email },
      });

      if (!user) {
        throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await this.prismaService.user.update({
        where: { email: decoded.email },
        data: { password: hashedPassword },
      });

      return 'Password reset successfully';
    } catch (error) {
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
