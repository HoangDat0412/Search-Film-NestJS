import {
  Controller,
  Post,
  Body,
  Req,
  Delete,
  Param,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WatchHistoryService } from './watch-history.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('watch-history')
export class WatchHistoryController {
  constructor(private readonly watchHistoryService: WatchHistoryService) {}

  @Post()
  @UseGuards(AuthGuard)
  async addWatchHistory(@Body() body: { movieId: number }, @Req() req: any) {
    const userId = req.user_data.user_id; // Lấy user_id từ request
    return this.watchHistoryService.addWatchHistory(userId, body.movieId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async deleteWatchHistory(@Param('id') id: string, @Req() req: any) {
    const userId = req.user_data.user_id;
    return this.watchHistoryService.deleteWatchHistory(+id, userId);
  }

  @Get()
  @UseGuards(AuthGuard)
  async getWatchHistory(
    @Req() req: any,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const userId = req.user_data.user_id;
    return this.watchHistoryService.getWatchHistory(userId, +page || 1, +limit || 10);
  }
}
