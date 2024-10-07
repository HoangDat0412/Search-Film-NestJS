import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [NotificationController],
  providers: [NotificationService, UserService]
})
export class NotificationModule {}
