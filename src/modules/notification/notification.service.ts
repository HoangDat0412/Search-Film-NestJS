import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async createNotification(data: {
    user_id: number;
    message: string;
    read: boolean;
  }) {
    return this.prisma.notification.create({
      data,
    });
  }

  // Tìm tất cả admin
  async findAdmins() {
    return this.prisma.user.findMany({
      where: {
        role: 'admin',
      },
      select: {
        user_id: true, // Chỉ cần lấy user_id để gửi thông báo
      },
    });
  }

  // Gửi thông báo cho tất cả admin
  async notifyAdmins(message: string) {
    const admins = await this.findAdmins();

    for (const admin of admins) {
      await this.createNotification({
        user_id: admin.user_id,
        message,
        read: false,
      });
    }

    return {
      success: true,
      message: `Notification sent to ${admins.length} admin(s).`,
    };
  }

  async getNotifications(userId: number) {
    return await this.prisma.notification.findMany({
      where: { user_id: userId },
    });
  }

  //trigger khi nguoiwf dung an vao xem noti
  async markAsRead(notificationId: number) {
    return await this.prisma.notification.update({
      where: { notification_id: notificationId },
      data: {
        read: true,
      },
    });
  }

  async deleteNotification(notificationId: number, userId: number) {
    const existedNotification = await this.prisma.notification.findUnique({
      where: {
        notification_id: notificationId,
        user_id: userId,
      },
    });

    if (!existedNotification) {
      throw new HttpException('Resource Not Found', HttpStatus.NOT_FOUND);
    }
    return await this.prisma.notification.delete({
      where: { notification_id: notificationId, user_id: userId },
    });
  }
}
