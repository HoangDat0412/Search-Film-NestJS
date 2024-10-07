import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AllExceptionsFilter } from '../all-exceptions/all-exceptions.filter';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';

@Controller('notifications')
@ApiTags('notifications')
@UseFilters(AllExceptionsFilter)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
  ) {}

  @Post('send')
  async sendNotificationToUser(@Body() { user_id, title, content }) {
    await this.notificationService.createNotification({
      user_id: +user_id,
      message: `${title}: ${content}`,
      read: false,
    });
    return { success: true, message: 'Notification sent to user.' };
  }

  @Post('send-all')
  async sendNotificationToAllUsers(@Body() { title, content }) {
    const users = await this.userService.getAllUsers();
    
    for (const user of users.users) {
      await this.notificationService.createNotification({
        user_id: user.user_id,
        message: `${title}: ${content}`,
        read: false,
      });
    }

    return { success: true, message: 'Notification sent to all users.' };
  }

  @Get()
  @UseGuards(AuthGuard)
  async getNotifications(@Req() req: any) {
    const userId = req.user_data.user_id; //thay sau
    const noti = await this.notificationService.getNotifications(+userId);
    return noti;
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  async markNotificationAsRead(@Param('id') notificationId: string) {
    const markRead = await this.notificationService.markAsRead(+notificationId);
    return markRead;
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async removeNotification(
    @Param('id') notificationId: string,
    @Req() req: any,
  ) {
    const userId = req.user_data.user_id; //thay sau
    const delNotification = await this.notificationService.deleteNotification(
      +notificationId,
      +userId,
    );
    return delNotification;
  }
}
