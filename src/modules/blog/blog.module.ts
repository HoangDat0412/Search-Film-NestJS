import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { NotificationService } from '../notification/notification.service';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  providers: [BlogService, NotificationService],
  controllers: [BlogController]
})
export class BlogModule {}
