import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedControler } from './feed.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [FeedControler],
  providers: [FeedService, PrismaService],
})
export class FeedModule {}
