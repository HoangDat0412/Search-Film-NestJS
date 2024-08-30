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

  async getRate(movie_id: number) {
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
}
