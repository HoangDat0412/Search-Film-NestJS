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

@Controller('request-feature')
@ApiTags('request-feature')
export class RequestFeatureController {
  constructor(private readonly requestFeaturesService: RequestFeatureService) {}

  @Get()
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  async findAll(
    @Query('search') search: string = '',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.requestFeaturesService.findAll(search, page, limit);
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
  ): Promise<RequestFeature> {
    // const url_image = file ? file.path : '';
    const url_image = `/uploads/requestnewfeature/${file.filename}`;
    const user_id = req.user_data.user_id;
    return this.requestFeaturesService.create({
      ...createRequestFeatureDto,
      url_image,
      user_id,
    });
  }

  @Delete(':feature_id')
  @UseGuards(AuthGuard, new RoleGuard(['admin', 'content creator']))
  async remove(@Param('feature_id') feature_id: string) {
    return this.requestFeaturesService.remove(+feature_id);
  }
}
