// server/src/modules/social/social.module.ts
import { Module } from '@nestjs/common';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { FeedModule } from './feed.module';

@Module({
  imports: [PrismaModule, AuthModule, FeedModule], // Importar Prisma (Banco) e Auth (Guards)
  controllers: [SocialController],
  providers: [SocialService],
})
export class SocialModule {}