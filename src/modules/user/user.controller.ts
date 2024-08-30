import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
import { ApiTags } from '@nestjs/swagger';
import { UpdateUsernameDto } from './dtos/update-username.dto';
import { UpdateEmailDto } from './dtos/update-email.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { createMulterOptions } from './uploadFile/multer.config';

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



  @Get('get/me')
  @UseGuards(AuthGuard)
  getMe(@Req() req: any) {
    const user_id = req.user_data.user_id;
    return this.userService.getMe(Number(user_id));
  }

  @Post('avatar')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar', createMulterOptions('avatars')))
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

  @Put('/enable-2fa')
  @UseGuards(AuthGuard)
  enable2fa(@Req() req: any) {
    const user_id = req.user_data.user_id;
    return this.userService.enable2fa(user_id);
  }

  @Patch('/username')
  @UseGuards(AuthGuard)
  async updateUsername(
    @Req() req,
    @Body() updateUsernameDto: UpdateUsernameDto,
  ) {
    return this.userService.updateUsername(
      req.user_data.user_id,
      updateUsernameDto,
    );
  }

  @Patch('/email')
  @UseGuards(AuthGuard)
  async updateEmail(@Req() req, @Body() updateEmailDto: UpdateEmailDto) {
    return this.userService.updateEmail(req.user_data.user_id, updateEmailDto);
  }

  @Patch('/password')
  @UseGuards(AuthGuard)
  async changePassword(
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(
      req.user_data.user_id,
      changePasswordDto,
    );
  }

  @Put('/disable-2fa')
  @UseGuards(AuthGuard)
  disable2fa(@Req() req: any) {
    const user_id = req.user_data.user_id;
    return this.userService.disable2fa(user_id);
  }

  // Api admin

  @Get('/listuser/all')
  @UseGuards(AuthGuard, new RoleGuard(['admin']))
  getAll(@Query() query: FilterUserDto) {
    return this.userService.getAll(query);
  }

  @Get('/:id')
  @UseGuards(AuthGuard, new RoleGuard(['admin']))
  getDetail(@Param('id') id: string) {
    return this.userService.getUserDetail(Number(id));
  }

  @Put('/admin/users/:id')
  @UseGuards(AuthGuard, new RoleGuard(['admin']))
  updateUserByAdmin(
    @Param('id') id: string,
    @Body() userData: UpdateUserByAdminDto,
  ): Promise<User> {
    return this.userService.updateUserByAdmin(Number(id), userData);
  }

  @Delete('/admin/users/:id')
  @UseGuards(AuthGuard, new RoleGuard(['admin']))
  deleteUserByAdmin(@Param('id') id: string): Promise<User> {
    return this.userService.deleteUserByAdmin(Number(id));
  }

  @Get('/admin/users/search')
  @UseGuards(AuthGuard, new RoleGuard(['admin']))
  getUserByAdmin(@Query() query: FilterUserDto) {
    return this.userService.getUserByAdmin(query);
  }
}
