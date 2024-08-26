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
import { PlaylistService } from '../playlist/playlist.service';
import { CreatePlaylist } from '../playlist/dto/create-playlist.dto';
import { AllExceptionsFilter } from '../all-exceptions/all-exceptions.filter';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { FilterUserDto } from './dtos/filter-user.dto';
import { UpdateUserByAdminDto } from './dtos/update-user-by-admin.dto';
import { User } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './uploadFile/multer.config';

import { ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('users')
@UseFilters(AllExceptionsFilter)
export class UserController {
  constructor(
    private readonly playlistService: PlaylistService,
    private userService: UserService,
  ) {}

  @Post('playlists')
  @UseGuards(AuthGuard)
  async createPlaylist(
    @Body() createPlaylist: CreatePlaylist,
    @Req() req: any,
  ) {
    const userId = req.user_data.user_id; //sau thay token
    const playlist = await this.playlistService.createPlaylist(
      +userId,
      createPlaylist,
    );
    return playlist;
  }

  @Get('playlists')
  @UseGuards(AuthGuard)
  async getPlaylist(@Req() req: any) {
    const userId = req.user_data.user_id; //sau thay token
    const playlists = await this.playlistService.getPlaylists(+userId);
    return playlists;
  }

  @UseGuards(new RoleGuard(['admin']))
  @UseGuards(AuthGuard)
  @Get('/:id')
  getDetail(@Param('id') id: string) {
    return this.userService.getUserDetail(Number(id));
  }

  @UseGuards(AuthGuard)
  @Get('get/me')
  getMe(@Req() req: any) {
    const user_id = req.user_data.user_id;
    return this.userService.getMe(Number(user_id));
  }

  @UseGuards(new RoleGuard(['admin']))
  @UseGuards(AuthGuard)
  @Get('get-all')
  getAll(@Query() query: FilterUserDto) {
    return this.userService.getAll(query);
  }

  @UseGuards(AuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  async uploadAvatar(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const protocol = req.protocol;
    const host = req.get('host'); 
    let avatarUrl = `/uploads/avatars/${file.filename}`;
    avatarUrl = `${protocol}://${host}${avatarUrl}`;
    return this.userService.uploadAvatar(req, avatarUrl);
  }

  @UseGuards(AuthGuard)
  @Put('/enable-2fa')
  enable2fa(@Req() req: any) {
    const user_id = req.user_data.user_id;
    return this.userService.enable2fa(user_id);
  }

  @UseGuards(AuthGuard)
  @Put('/me')
  updateByUser(@Req() req: any, @Body() userData: any) {
    const user_id = req.user_data.user_id;
  }

  @UseGuards(AuthGuard)
  @Put('/disable-2fa')
  disable2fa(@Req() req: any) {
    const user_id = req.user_data.user_id;
    return this.userService.disable2fa(user_id);
  }

  // Api admin

  @UseGuards(new RoleGuard(['admin']))
  @UseGuards(AuthGuard)
  @Put('/admin/users/:id')
  updateUserByAdmin(
    @Param('id') id: string,
    @Body() userData: UpdateUserByAdminDto,
  ): Promise<User> {
    return this.userService.updateUserByAdmin(Number(id), userData);
  }

  @UseGuards(new RoleGuard(['admin']))
  @UseGuards(AuthGuard)
  @Delete('/admin/users/:id')
  deleteUserByAdmin(@Param('id') id: string): Promise<User> {
    return this.userService.deleteUserByAdmin(Number(id));
  }

  @UseGuards(new RoleGuard(['admin']))
  @UseGuards(AuthGuard)
  @Get('/admin/users/search')
  getUserByAdmin(@Query() query: FilterUserDto) {
    return this.userService.getUserByAdmin(query);
  }
}
