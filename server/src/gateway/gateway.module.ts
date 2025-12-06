import { forwardRef, Module } from '@nestjs/common';
import { AppGateway } from './app.gateway';
import { AuthModule } from '../modules/auth/auth.module';
import { ChatModule } from 'src/modules/chat/chat.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AuthModule, 
    JwtModule,  
    forwardRef(() => ChatModule),
  ],
  providers: [AppGateway],
  exports: [AppGateway], 
})
export class GatewayModule {}