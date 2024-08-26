import { Module } from '@nestjs/common';
import { ReportBugService } from './report-bug.service';
import { ReportBugController } from './report-bug.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [PrismaModule, JwtModule.register({})],
  providers: [ReportBugService],
  controllers: [ReportBugController]
})
export class ReportBugModule {}
