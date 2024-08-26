import { Body, Controller, Delete, Param, Put, Req, UseGuards } from '@nestjs/common';
import { PlaylistService } from './playlist.service';
import { CreatePlaylist } from './dto/create-playlist.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('playlists')
@ApiTags('playlists')
export class PlaylistController {
    constructor (private readonly playlistService: PlaylistService) {}

    @Put(':playlistId')
    @UseGuards(AuthGuard)
    async editPlaylist (@Param('playlistId') id: string, @Body() updatePlaylist : CreatePlaylist, @Req() req: any) {
        const userId = req.user_data.user_id;; //sau thay token
        const newPlaylist = await this.playlistService.editPlaylist(+id, +userId, updatePlaylist);
        return newPlaylist;
    }

    @Delete(':playlistId')
    async deletePlaylist (@Param('playlistId') id: string,@Req() req:any) {
        const userId = req.user_data.user_id;//sau thay token
        const playlist = await this.playlistService.deletePlaylist(+id, +userId);
        return playlist;
    }

    @Delete(':playlistId/movie')
    async removeMovieFromPlaylist (@Param('playlistId') category_id: string, @Body() {movie_id}: {movie_id: string}) {
        const newPlaylist = await this.playlistService.removeMovieFromPlaylist(+category_id, +movie_id);
        return newPlaylist;
    }
}
