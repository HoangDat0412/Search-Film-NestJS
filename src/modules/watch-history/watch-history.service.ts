import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class WatchHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async addWatchHistory(userId: number, movieId: number) {
    // Thêm bản ghi vào bảng WatchHistory
    return await this.prisma.watchHistory.create({
      data: {
        user_id: userId,
        movie_id: movieId,
        watched_at: new Date(), // Tự động ghi lại thời gian xem
      },
    });
  }

  async deleteWatchHistory(historyId: number, userId: number) {
    // Kiểm tra lịch sử xem có tồn tại không và có thuộc về user không
    const history = await this.prisma.watchHistory.findUnique({
      where: { history_id: historyId },
    });

    if (!history || history.user_id !== userId) {
      throw new ForbiddenException(
        'You can only delete your own watch history',
      );
    }

    // Xóa lịch sử xem
    return await this.prisma.watchHistory.delete({
      where: { history_id: historyId },
    });
  }

  async getWatchHistory(userId: number, page: number, limit: number) {
    // Tính toán offset để phân trang
    const offset = (page - 1) * limit;

    // Lấy danh sách watch history theo phân trang
    const histories = await this.prisma.watchHistory.findMany({
      where: { user_id: userId },
      skip: offset,
      take: limit,
      orderBy: { watched_at: 'desc' }, // Sắp xếp theo thời gian xem mới nhất
      include: {
        movie: true, // Bao gồm thông tin về phim nếu cần
      },
    });

    // Tính tổng số lượng lịch sử xem để trả về cho phía frontend
    const totalCount = await this.prisma.watchHistory.count({
      where: { user_id: userId },
    });

    return {
      data: histories,
      total: totalCount,
      page,
      limit,
    };
  }
}
