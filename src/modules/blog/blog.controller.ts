import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BlogService } from './blog.service';
import { createMulterOptions } from '../user/uploadFile/multer.config';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { FindAllBlogDto } from './dto/find-all-blog.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('blog')
@ApiTags('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @UseGuards(AuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('image_url', createMulterOptions('BlogImages')),
  )
  async create(
    @Body() createBlogDto: CreateBlogDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const imageUrl = file ? `/uploads/BlogImages/${file.filename}` : null;
    return this.blogService.create({
      ...createBlogDto,
      image_url: imageUrl,
      user_id: req.user_data.user_id,
    });
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image_url', createMulterOptions('BlogImages')),
  )
  async update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const imageUrl = file
      ? `/uploads/BlogImages/${file.filename}`
      : updateBlogDto.image_url;
    return this.blogService.update(
      +id,
      { ...updateBlogDto, image_url: imageUrl },
      req.user_data.user_id,
      req.user_data.role === 'admin',
    );
  }

  @Get()
  findAll(@Query() query: FindAllBlogDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const searchTerm = query.searchTerm || ''
    return this.blogService.findAll(page, limit, searchTerm);
  }

  @Get('admin/getall')
  adminFindAll(@Query() query: FindAllBlogDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const searchTerm = query.searchTerm || ''
    return this.blogService.findAllBlog(page, limit, searchTerm);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.blogService.remove(
      +id,
      req.user_data.user_id,
      req.user_data.role === 'admin',
    );
  }

  @Get('search')
  search(@Query('term') term: string) {
    return this.blogService.search(term);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/verify')
  verifyBlog(@Param('id') id: string, @Request() req) {
    return this.blogService.verifyBlog(+id, req.user_data.role === 'admin');
  }

  // Other methods remain unchanged...
}
