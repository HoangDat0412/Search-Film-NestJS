import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { CreatePlaylist } from './dto/create-playlist.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { GetMoviesByCategoryDto } from './dto/get-movies-by-category.dto';

@Controller('playlists')
@ApiTags('playlists')
export class PlaylistController {
  constructor(private readonly playlistService: PlaylistService) {}

  @Put(':playlistId')
  @UseGuards(AuthGuard)
  async editPlaylist(
    @Param('playlistId') id: string,
    @Body() updatePlaylist: CreatePlaylist,
    @Req() req: any,
  ) {
    const userId = req.user_data.user_id; //sau thay token
    const newPlaylist = await this.playlistService.editPlaylist(
      +id,
      +userId,
      updatePlaylist,
    );
    return newPlaylist;
  }

  @Get(':categoryId')
  @UseGuards(AuthGuard)
  async getMoviePlaylist(
    @Query() query: GetMoviesByCategoryDto,
    @Req() req: any,
    @Param('categoryId') categoryId: string,
  ) {
    const page = Number(query.page) || 1;
    const pageSize = Number(query.pageSize) || 10;
    return this.playlistService.getMoviesByCategory(
      +categoryId,
      page,
      pageSize,
      req.user_data.user_id,
    );
  }

  // delete một playlist film
  @Delete(':playlistId')
  @UseGuards(AuthGuard)
  async deletePlaylist(@Param('playlistId') id: string, @Req() req: any) {
    const userId = req.user_data.user_id;

    const playlist = await this.playlistService.deletePlaylist(+id, +userId);
    return playlist;
  }
  // delete một movie film from playlist 
  @Delete(':playlistId/movie')
  @UseGuards(AuthGuard)
  async removeMovieFromPlaylist(
    @Param('playlistId') category_id: string,
    @Body() { movie_id }: { movie_id: string },
  ) {
    const newPlaylist = await this.playlistService.removeMovieFromPlaylist(
      +category_id,
      +movie_id,
    );
    return newPlaylist;
  }
}
