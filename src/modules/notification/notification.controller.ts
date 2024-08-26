import { Body, Controller, Delete, Get, Param, Put, Req, UseFilters, UseGuards } from '@nestjs/common';
import { AllExceptionsFilter } from '../all-exceptions/all-exceptions.filter';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ApiTags } from '@nestjs/swagger';

@Controller('notifications')
@ApiTags('notification')
@UseFilters(AllExceptionsFilter)
export class NotificationController {
    constructor (private readonly notificationService: NotificationService){}

    @Get()
    @UseGuards(AuthGuard)
    async getNotifications (@Req() req:any) {
        const userId = req.user_data.user_id; //thay sau
        const noti = await this.notificationService.getNotifications(+userId);
        return noti;
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    async markNotificationAsRead (@Param('id') notificationId: string) {
        const markRead = await this.notificationService.markAsRead(+notificationId);
        return markRead;
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async removeNotification (@Param('id') notificationId: string, @Req() req:any) {
        const userId = req.user_data.user_id;   //thay sau
        const delNotification = await this.notificationService.deleteNotification(+notificationId, +userId);
        return delNotification;
    }
}
