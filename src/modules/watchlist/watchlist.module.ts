import { Module } from '@nestjs/common';
import { WatchlistController } from './watchlist.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { WatchlistService } from './watchlist.service';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  controllers: [WatchlistController],
  providers: [WatchlistService],
})
export class WatchlistModule {}
