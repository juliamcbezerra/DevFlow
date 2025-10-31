import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { TaskModule } from './task/task.module';
import { SocialModule } from './social/social.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AuthModule, ProjectModule, TaskModule, SocialModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
