import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
@Controller('watchlist')
@ApiTags('watchlist')
export class WatchlistController {
  constructor(private readonly watchlistService: WatchlistService) {}

  @Get(':id')
  @UseGuards(AuthGuard)
  async toggleWatchlist(@Req() req: any, @Param('id') movieId: string) {
    const userId = req.user_data.user_id; // Lấy userId từ JWT token hoặc session
    await this.watchlistService.toggleWatchlist(+userId, +movieId);
    return { message: 'Action completed successfully' };
  }

  @Get()
  @UseGuards(AuthGuard)
  async getUserWatchlist(@Req() req: any) {
    const userId = req.user_data.user_id;
    return this.watchlistService.getUserWatchlist(+userId);
  }

  @Get('check/:movie_id') // Get movie_id from the URL
  @UseGuards(AuthGuard)
  async checkMovieInWatchlist(
    @Req() req: any,
    @Param('movie_id') movie_id: string,
  ): Promise<{ isInWatchlist: boolean }> {
    const user_id = req.user_data.user_id;
    const isInWatchlist = await this.watchlistService.isMovieInWatchlist({
      user_id,
      movie_id: +movie_id, // Convert movie_id from string to number
    });
    return { isInWatchlist };
  }
}
