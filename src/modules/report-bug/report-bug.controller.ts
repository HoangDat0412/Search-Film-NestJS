import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReportBugService } from './report-bug.service';
import { CreateReportBugDto } from './dto/create-report-bug.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { createMulterOptions } from '../user/uploadFile/multer.config';
import { RoleGuard } from '../auth/guards/role.guard';
import { NotificationService } from '../notification/notification.service';

@Controller('report-bug')
@ApiTags('report-bug')
export class ReportBugController {
  constructor(
    private readonly reportBugsService: ReportBugService,
    private readonly notificationService: NotificationService,
  ) {}

  @Get()
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  async findAll(
    @Query('search') search: string = '',
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.reportBugsService.findAll(search, +page || 1, +limit || 10);
  }

  @Get('all/me')
  @UseGuards(AuthGuard)
  async findAllUser(
    @Query('search') search: string = '',
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req: any,
  ) {
    const user_id = req.user_data.user_id;
    return this.reportBugsService.findAllUser(
      search,
      +page || 1,
      +limit || 10,
      +user_id,
    );
  }

  @Get(':bug_id')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  async findOne(@Param('bug_id') bug_id: string) {
    return this.reportBugsService.findOne(+bug_id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file', createMulterOptions('reportbug')))
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createReportBugDto: CreateReportBugDto,
    @Req() req: any,
  ) {
    const url_image = `/uploads/reportbug/${file.filename}`;
    const user_id = req.user_data.user_id;
    const report = await this.reportBugsService.create({
      ...createReportBugDto,
      url_image,
      user_id,
    });

    await this.notificationService.notifyAdmins(
      `A new bug report has been submitted by user ${report.user_id}.`,
    );

    return {
      success: true,
      message: 'Bug report created and notification sent to admin.',
    };
  }

  @Delete(':bug_id')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  async remove(@Param('bug_id') bug_id: string) {
    return this.reportBugsService.remove(+bug_id);
  }
}
