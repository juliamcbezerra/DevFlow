import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProjectModule } from './modules/project/project.module';
import { SocialModule } from './modules/social/social.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [AuthModule, UserModule, ProjectModule, SocialModule, PrismaModule],
})
export class AppModule {}
