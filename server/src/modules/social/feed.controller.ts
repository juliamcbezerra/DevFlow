import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { JwtGuard } from 'src/modules/jwt/jwt.guard';
import { FeedService } from './feed.service';
import { GetFeedDto } from './dto/get-feed.dto';

@Controller('feed')
export class FeedControler {
    constructor(private readonly feedService: FeedService) {}

    // Retorna o feed de posts dos projetos seguidos pelo usuário
    @UseGuards(JwtGuard)
    @Get()
    async getFeed(@Query() query: GetFeedDto, @Req() req) {
        return this.feedService.getFeed({
            userId: req.user.userId,
            cursor: query.cursor || null,
            limit: query.limit ? Number(query.limit) : 20,
        });
    }
}