import { Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [PrismaModule, JwtModule.register({})],
  providers: [RatingService],
  controllers: [RatingController],
})
export class RatingModule {}
