import { Module } from '@nestjs/common';
import { RequestFeatureController } from './request-feature.controller';
import { RequestFeatureService } from './request-feature.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { NotificationService } from '../notification/notification.service';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [RequestFeatureController],
  providers: [RequestFeatureService, NotificationService]
})
export class RequestFeatureModule {}
