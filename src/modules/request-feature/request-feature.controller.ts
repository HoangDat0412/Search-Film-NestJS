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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RequestFeatureService } from './request-feature.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { RequestFeature } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { createMulterOptions } from '../user/uploadFile/multer.config';
import { RoleGuard } from '../auth/guards/role.guard';
import { NotificationService } from '../notification/notification.service';

@Controller('request-feature')
@ApiTags('request-feature')
export class RequestFeatureController {
  constructor(
    private readonly requestFeaturesService: RequestFeatureService,
    private readonly notificationService: NotificationService,
  ) {}

  @Get()
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  async findAll(
    @Query('search') search: string = '',
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.requestFeaturesService.findAll(
      search,
      +page || 1,
      +limit || 10,
    );
  }

  @Get('me/allfeauture')
  @UseGuards(AuthGuard)
  async findAllUser(
    @Query('search') search: string = '',
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req: any,
  ) {
    const user_id = req.user_data.user_id;
    return this.requestFeaturesService.findAllUser(
      search,
      +page || 1,
      +limit || 10,
      +user_id,
    );
  }

  @Get(':feature_id')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  async findOne(
    @Param('feature_id') feature_id: string,
  ): Promise<RequestFeature> {
    return this.requestFeaturesService.findOne(+feature_id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', createMulterOptions('requestnewfeature')),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body()
    createRequestFeatureDto: {
      title: string;
      description: string;
    },
    @Req() req: any,
  ): Promise<any> {
    // const url_image = file ? file.path : '';
    const url_image = `/uploads/requestnewfeature/${file.filename}`;
    const user_id = req.user_data.user_id;
    const feature = await this.requestFeaturesService.create({
      ...createRequestFeatureDto,
      url_image,
      user_id,
    });

    // Gửi thông báo cho tất cả admin
    await this.notificationService.notifyAdmins(
      `A new feature request has been submitted by user ${feature.user_id}.`,
    );

    return {
      success: true,
      message: 'Feature request created and notifications sent to all admins.',
    };
  }

  @Delete(':feature_id')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  async remove(@Param('feature_id') feature_id: string) {
    return this.requestFeaturesService.remove(+feature_id);
  }
}
