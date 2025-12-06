import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppGateway } from '../../gateway/app.gateway';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private appGateway: AppGateway
  ) {}

  async createAndSend(
    userId: string, 
    content: string, 
    type: NotificationType,
    triggerUserId?: string,
    projectId?: string,    
    inviteRole?: 'ADMIN' | 'MEMBER' | 'OWNER' 
  ) {

    // 1. Salva no Banco
    const notification = await this.prisma.notification.create({
      data: { 
        userId, 
        content, 
        type, 
        triggerUserId,
        projectId,
        inviteRole: inviteRole as any 
      },
      include: { 
          triggerUser: { select: { name: true, avatarUrl: true } },
          project: { select: { name: true } } 
      }
    });

    // 2. Envia via Socket
    console.log(`🔔 [Notification] Enviando para user_${userId}`);
    this.appGateway.server.to(`user_${userId}`).emit('notification', notification);

    return notification;
  }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        triggerUser: { select: { name: true, avatarUrl: true, username: true } }
      }
    });
  }

  async markAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
    return { success: true };
  }

  async markOneAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId, userId },
      data: { read: true }
    });
  }

  async remove(userId: string, notificationId: string) {
    return this.prisma.notification.delete({
      where: { id: notificationId, userId }
    });
  }
}