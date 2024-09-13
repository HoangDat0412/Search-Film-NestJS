import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddRatingDto } from './dto/add-rating.dto';

@Injectable()
export class RatingService {
  constructor(private prisma: PrismaService) {}

  async addRating(
    movie_id: number,
    user_id: number,
    addRatingDto: AddRatingDto,
  ) {
    const existingRating = await this.prisma.rating.findFirst({
      where: {
        movie_id,
        user_id,
      },
    });

    if (existingRating) {
      throw new BadRequestException('You already rating this film');
    }
    if (addRatingDto.score < 1 || addRatingDto.score > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }
    return this.prisma.rating.create({
      data: {
        score: addRatingDto.score,
        review: addRatingDto.review,
        movie: { connect: { movie_id: movie_id } },
        user: { connect: { user_id: user_id } },
      },
    });
  }

  async getMovieRatings(movieId: number, userId: number) {
    const ratings = await this.prisma.rating.findMany({
      where: { movie_id: movieId },
      include: {
        user: {
          select: {
            user_id: true,
            username: true,
            avatar_url: true,
          },
        }
      },
    });

    const formattedRatings = await Promise.all(
      ratings.map(async (rating) => {
        // Đếm số lượng like và dislike
        const likeCount = await this.prisma.ratingLikeDislike.count({
          where: { rating_id: rating.rating_id, is_like: true },
        });
        const dislikeCount = await this.prisma.ratingLikeDislike.count({
          where: { rating_id: rating.rating_id, is_like: false },
        });

        // Kiểm tra xem người dùng đã like hoặc dislike rating này chưa
        const userLikeDislike = await this.prisma.ratingLikeDislike.findUnique({
          where: {
            user_id_rating_id: {
              user_id: userId,
              rating_id: rating.rating_id,
            },
          },
        });

        return {
          ...rating,
          likeCount,
          dislikeCount,
          userAction: userLikeDislike
            ? userLikeDislike.is_like
              ? 'like'
              : 'dislike'
            : null, // Trả về trạng thái của người dùng
        };
      }),
    );

    // Tính điểm trung bình của bộ phim
    const averageScore = await this.prisma.rating.aggregate({
      where: { movie_id: movieId },
      _avg: {
        score: true,
      },
    });

    return {
      ratings: formattedRatings,
      averageScore: averageScore._avg.score || 0, // Trả về điểm trung bình, nếu không có thì mặc định là 0
    };
  }

  async getListRating(movie_id: number) {
    return this.prisma.rating.findMany({
      where: { movie_id },
    });
  }

  async getRateByUser(movie_id: number, user_id: number) {
    const existMovie = await this.prisma.movie.findFirst({
      where: {
        movie_id,
      },
    });
    if (!existMovie) {
      throw new HttpException('Movie Is Not Exist', HttpStatus.NOT_FOUND);
    }

    return await this.prisma.rating.findFirst({
      where: { movie_id, user_id },
    });
  }

  async editOwnRate(
    rating_id: number,
    movie_id: number,
    user_id: number,
    updateRatingDto: AddRatingDto,
  ) {
    const existMovie = await this.prisma.movie.findFirst({
      where: {
        movie_id,
      },
    });
    if (!existMovie) {
      throw new HttpException('Movie Is Not Exist', HttpStatus.NOT_FOUND);
    }

    return await this.prisma.rating.update({
      where: { rating_id, movie_id, user_id },
      data: {
        score: updateRatingDto.score,
        review: updateRatingDto.review,
      },
    });
  }

  async getRatingByUserAndMovie(userId: number, movieId: number): Promise<any> {
    // Tìm đánh giá của người dùng cho bộ phim cụ thể
    const rating = await this.prisma.rating.findFirst({
      where: {
        user_id: userId,
        movie_id: movieId,
      },
    });

    if (!rating) {
      throw new NotFoundException('Đánh giá không tìm thấy.');
    }

    return rating;
  }

  async likeRating(userId: number, ratingId: number) {
    // Kiểm tra xem đã có like/dislike chưa
    const existing = await this.prisma.ratingLikeDislike.findUnique({
      where: {
        user_id_rating_id: { user_id: userId, rating_id: ratingId },
      },
    });

    if (existing) {
      if (existing.is_like) {
        // Người dùng đã like, nên bỏ like
        await this.prisma.ratingLikeDislike.delete({
          where: {
            id: existing.id,
          },
        });
      } else {
        // Đang dislike, chuyển sang like
        await this.prisma.ratingLikeDislike.update({
          where: {
            id: existing.id,
          },
          data: {
            is_like: true,
          },
        });
      }
    } else {
      // Thêm like mới
      await this.prisma.ratingLikeDislike.create({
        data: {
          user_id: userId,
          rating_id: ratingId,
          is_like: true,
        },
      });
    }
  }

  async dislikeRating(userId: number, ratingId: number) {
    const existing = await this.prisma.ratingLikeDislike.findUnique({
      where: {
        user_id_rating_id: { user_id: userId, rating_id: ratingId },
      },
    });

    if (existing) {
      if (!existing.is_like) {
        // Đã dislike, nên bỏ dislike
        await this.prisma.ratingLikeDislike.delete({
          where: {
            id: existing.id,
          },
        });
      } else {
        // Đang like, chuyển sang dislike
        await this.prisma.ratingLikeDislike.update({
          where: {
            id: existing.id,
          },
          data: {
            is_like: false,
          },
        });
      }
    } else {
      // Thêm dislike mới
      await this.prisma.ratingLikeDislike.create({
        data: {
          user_id: userId,
          rating_id: ratingId,
          is_like: false,
        },
      });
    }
  }
}
