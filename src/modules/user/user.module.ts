import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PlaylistService } from '../playlist/playlist.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule,  JwtModule.register({})],
  controllers: [UserController],
  providers: [UserService, PlaylistService],
})
export class UserModule {}
