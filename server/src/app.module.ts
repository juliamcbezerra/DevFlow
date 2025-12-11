import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ChatModule } from './modules/chat/chat.module'; 
import { SocialModule } from './modules/social/social.module';
import { PrismaModule } from './prisma/prisma.module';
import { UploadModule } from './upload/upload.module';
import { ProjectModule } from './modules/project/project.module';
import { GatewayModule } from './gateway/gateway.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    PrismaModule,
    AuthModule, 
    ChatModule, 
    UserModule,
    SocialModule,
    ProjectModule,
    GatewayModule,
    UploadModule,
    ConfigModule.forRoot({
      envFilePath: join(__dirname, '../../.env'),
      isGlobal: true,
      expandVariables: true,
    })
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}