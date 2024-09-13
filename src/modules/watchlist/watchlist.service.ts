import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WatchlistService {
  constructor(private prisma: PrismaService) {}

  async toggleWatchlist(userId: number, movieId: number) {
    const existingEntry = await this.prisma.watchlist.findUnique({
      where: { user_id_movie_id: { user_id: userId, movie_id: movieId } },
    });

    if (existingEntry) {
      // Nếu đã có, xóa phim khỏi Watchlist
      return this.prisma.watchlist.delete({
        where: { user_id_movie_id: { user_id: userId, movie_id: movieId } },
      });
    } else {
      // Nếu chưa có, thêm phim vào Watchlist
      return this.prisma.watchlist.create({
        data: { user_id: userId, movie_id: movieId },
      });
    }
  }

  async getUserWatchlist(userId: number) {
    return await this.prisma.watchlist.findMany({
      where: {
        user_id: userId,
      },
      include: {
        movie: true, // Lấy thông tin phim liên quan
      },
    });
  }
}
