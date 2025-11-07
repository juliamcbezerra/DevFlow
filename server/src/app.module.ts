import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ProjectModule } from './modules/project/project.module';
import { TaskModule } from './modules/task/task.module';
import { SocialModule } from './modules/social/social.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AuthModule, ProjectModule, TaskModule, SocialModule, PrismaModule],
})
export class AppModule {}
