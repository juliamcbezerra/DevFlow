import { Controller, Get, Patch, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { JwtGuard } from '../jwt/jwt.guard';
import { NotificationService } from './notification.service';

@UseGuards(JwtGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.notificationService.findAll(req.user.id);
  }

  @Patch('read') // Marca TODAS como lidas
  markAllRead(@Req() req: any) {
    return this.notificationService.markAsRead(req.user.id);
  }

  @Patch(':id/read') // Marca UMA como lida
  markOneRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationService.markOneAsRead(req.user.id, id);
  }

  @Delete(':id') // Exclui UMA
  remove(@Param('id') id: string, @Req() req: any) {
    return this.notificationService.remove(req.user.id, id);
  }
}