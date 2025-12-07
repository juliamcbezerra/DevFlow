import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ChatModule } from './modules/chat/chat.module'; 
import { SocialModule } from './modules/social/social.module';
import { PrismaModule } from './prisma/prisma.module';
import { UploadModule } from './upload/upload.module';
import { ProjectModule } from './modules/project/project.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule, 
    ChatModule, 
    UserModule,
    SocialModule,
    ProjectModule,
    GatewayModule,
    UploadModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}