import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { RatingService } from './rating.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';

@Controller('rating')
@ApiTags('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post('like/:id')
  @UseGuards(AuthGuard)
  async likeRating(@Param('id') ratingId: string, @Req() req) {
    const userId = req.user_data.user_id; // Lấy user ID từ token JWT

    await this.ratingService.likeRating(userId, +ratingId);
    return {
      message: 'Liked rating successfully or unliked if already liked.',
    };
  }

  // Route cho Dislike

  @Post('dislike/:id')
  @UseGuards(AuthGuard)
  async dislikeRating(@Param('id') ratingId: string, @Req() req) {
    const userId = req.user_data.user_id;
    await this.ratingService.dislikeRating(userId, +ratingId);
    return {
      message:
        'Disliked rating successfully or undisliked if already disliked.',
    };
  }
}
