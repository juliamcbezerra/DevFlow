import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { JwtGuard } from 'src/modules/jwt/jwt.guard';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedControler {
    constructor(private readonly feedService: FeedService) {}

    // Retorna o feed de posts dos projetos seguidos pelo usuário
    @UseGuards(JwtGuard)
    @Get()
    async getFeed(
        @Req() req, 
        @Query('limit') limit?: number, 
        @Query('cursor') cursor?: string 
    ) {
        const userId = req.user.sub;

        return this.feedService.getFeed({
            userId,
            limit: limit ? Number(limit) : 20,
            cursor,
        });
    }
}