import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlaylist } from './dto/create-playlist.dto';

@Injectable()
export class PlaylistService {
  constructor(private prisma: PrismaService) {}

  async createPlaylist(userId: number, createPlaylist: CreatePlaylist) {
    return await this.prisma.category.create({
      data: {
        name: createPlaylist.name,
        user: { connect: { user_id: userId } },
      },
    });
  }

  async getPlaylists(userId: number) {
    return this.prisma.category.findMany({
      where: {
        user_id: userId,
      },
      include: {
        category_movies: {
          take: 1, // Lấy bộ phim đầu tiên
          include: {
            movie: {
              select: {
                poster_url: true, // Chỉ lấy poster_url
              },
            },
          },
        },
      },
    });
  }

  async editPlaylist(
    category_id: number,
    userId: number,
    updatePlaylist: CreatePlaylist,
  ) {
    return this.prisma.category.update({
      where: { category_id },
      data: {
        name: updatePlaylist.name,
        user: { connect: { user_id: userId } },
      },
    });
  }

  async deletePlaylist(category_id: number, user_id: number) {
    return this.prisma.category.delete({
      where: { category_id, user_id },
    });
  }

  async removeMovieFromPlaylist(category_id: number, movie_id: number) {
    return this.prisma.categoryMovie.delete({
      where: {
        category_id_movie_id: {
          category_id,
          movie_id,
        },
      },
    });
  }

  async getMoviesByCategory(
    categoryId: number,
    page: number = 1,
    pageSize: number = 10,
    userId: number, // ID của người dùng hiện tại
  ): Promise<any> {
    // const skip = (page - 1) * pageSize;
    // const take = pageSize;

    // Kiểm tra xem người dùng có phải là người tạo ra Category không
    const category = await this.prisma.category.findUnique({
      where: { category_id: categoryId },
    });

    if (!category || category.user_id !== userId) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập vào danh mục này.',
      );
    }

    // Nếu kiểm tra quyền hạn thành công, thực hiện truy vấn phim
    const movies = await this.prisma.categoryMovie.findMany({
      where: { category_id: categoryId },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        movie: true, // Bao gồm thông tin chi tiết về movie
      },
    });

    const totalMovies = await this.prisma.categoryMovie.count({
      where: { category_id: categoryId },
    });

    return {
      playlist_name: category.name,
      movies: movies.map((cm) => cm.movie),
      total: totalMovies,
      page,
      pageSize,
      totalPages: Math.ceil(totalMovies / pageSize),
    };
  }
}
