import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { GatewayModule } from '../../gateway/gateway.module'; 

@Module({
  imports: [PrismaModule, GatewayModule], 
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService] // Exporta para o UserModule usar (ao seguir alguém)
})
export class NotificationModule {}