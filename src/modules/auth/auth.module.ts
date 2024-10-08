import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MailerService } from './mailersend/mailer.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpModule } from '@nestjs/axios'; // Import HttpModule
@Module({
  imports: [JwtModule.register({}), HttpModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtService, MailerService],
})
export class AuthModule {}
