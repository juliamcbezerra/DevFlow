import { Module } from '@nestjs/common';
import { AppGateway } from './gateway/app.gateway';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ChatModule } from './modules/chat/chat.module'; 
import { SocialModule } from './modules/social/social.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectModule } from './modules/project/project.module'; // Se tiver

@Module({
  imports: [
    PrismaModule,
    AuthModule, 
    ChatModule, 
    UserModule,
    SocialModule,
    ProjectModule,
  ],
  controllers: [],
  providers: [
    AppGateway,
  ],
})
export class AppModule {}