import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AppGateway } from '../../gateway/app.gateway'; // Importe a classe

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private appGateway: AppGateway // Injeção direta do Singleton
  ) {}

  async createAndSend(
    userId: string, 
    content: string, 
    type: 'LIKE' | 'COMMENT' | 'FOLLOW', 
    triggerUserId?: string
  ) {
    // 1. Salva no Banco
    const notification = await this.prisma.notification.create({
      data: { userId, content, type, triggerUserId },
      include: { triggerUser: { select: { name: true, avatarUrl: true } } }
    });

    // 2. Dispara o Socket
    console.log(`🔔 [Notification] Enviando para user_${userId}`);
    this.appGateway.server.to(`user_${userId}`).emit('notification', notification);

    return notification;
  }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20
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
      where: { id: notificationId, userId }, // Garante que só o dono pode marcar
      data: { read: true }
    });
  }

  // Excluir notificação
  async remove(userId: string, notificationId: string) {
    return this.prisma.notification.delete({
      where: { id: notificationId, userId } // Garante que só o dono pode deletar
    });
  }
}