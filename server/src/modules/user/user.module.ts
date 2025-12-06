import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller'; 
import { NotificationModule } from '../notification/notification.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, NotificationModule],
  controllers: [UserController], 
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {} 