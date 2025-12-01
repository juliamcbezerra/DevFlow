import {
  Controller, Post, Body, Param, UseGuards, Req, ValidationPipe, Get,
  NotFoundException, Patch, Delete, ForbiddenException, Query,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtGuard } from '../jwt/jwt.guard';
import { PrismaService } from '../../prisma/prisma.service';

@UseGuards(JwtGuard)
@Controller('social')
export class SocialController {
  constructor(
    private readonly socialService: SocialService,
    private readonly prisma: PrismaService 
  ) {}

  // --- 1. FEED E WIDGETS ---

  @Get('posts') 
  async findAllGlobal(@Req() req: any, @Query('type') type: string) {
    const feedType = type === 'following' ? 'following' : 'foryou';
    return this.socialService.findAllSmart(req.user.id, feedType);
  }

  // Widget: Trending Tags
  @Get('tags/trending')
  async getTrendingTags() {
    try {
        const result = await this.prisma.$queryRaw`
            SELECT tag, count(*)::int as count 
            FROM (SELECT unnest(tags) as tag FROM "Project") t 
            GROUP BY tag ORDER BY count DESC LIMIT 10
        `;
        return result; 
    } catch {
        return []; 
    }
  }

  // Widget: Sugestões
  @Get('users/suggestions')
  async getWhoToFollow(@Req() req: any) {
      const following = await this.prisma.follows.findMany({
          where: { followerId: req.user.id },
          select: { followingId: true }
      });
      const followingIds = following.map(f => f.followingId);

      return this.prisma.user.findMany({
          where: { id: { notIn: [req.user.id, ...followingIds] } },
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, username: true, avatarUrl: true }
      });
  }

  // --- 2. BUSCA POR USUÁRIO ---

  @Get('posts/user/:username')
  async findByUser(@Param('username') username: string, @Req() req: any) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const posts = await this.prisma.post.findMany({
      where: { authorId: user.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, username: true, avatarUrl: true } },
        project: { select: { id: true, name: true, slug: true } },
        votes: { select: { value: true, userId: true } }, // Importante: trazer userId
        _count: { select: { comments: true } }
      }
    });

    return posts.map(post => {
        const score = post.votes.reduce((acc, curr) => acc + curr.value, 0);
        // Calcula se EU votei neste post
        const userVote = post.votes.find(v => v.userId === req.user.id)?.value || 0;
        
        const { votes, ...rest } = post;
        return { 
            ...rest, 
            userVote, 
            _count: { comments: post._count.comments, votes: score } 
        };
    });
  }

  // --- 3. PROJETOS E POSTS ---

  @Post('projects/:projectId/posts')
  async createPost(@Param('projectId') projectId: string, @Body(ValidationPipe) dto: CreatePostDto, @Req() req: any) {
    return this.socialService.createPost(dto, req.user.id, projectId);
  }

  @Get('projects/:projectId/posts')
  async findAllByProject(@Param('projectId') projectId: string, @Req() req: any) {
    // CORREÇÃO CRÍTICA: Passando req.user.id para o service saber quem está vendo
    return this.socialService.findAllByProject(projectId, req.user.id);
  }

  // --- 4. INTERAÇÕES ---

  @Post('vote')
  async vote(@Body() body: { postId: string; value: number }, @Req() req: any) {
    const safeValue = body.value > 0 ? 1 : -1;
    return this.socialService.toggleVote(req.user.id, body.postId, { value: safeValue });
  }

  @Post('posts/:postId/comments')
  async createComment(@Param('postId') postId: string, @Body(ValidationPipe) dto: CreateCommentDto, @Req() req: any) {
    return this.socialService.createComment(req.user.id, postId, dto);
  }

  @Get('posts/:postId/comments')
  async getComments(@Param('postId') postId: string) {
    return this.socialService.getCommentsTree(postId);
  }

  @Get('posts/:postId')
  async getPost(@Param('postId') postId: string, @Req() req: any) {
    // Passando req.user.id para saber se votei no post individual
    return this.socialService.findPostById(postId, req.user.id);
  }

  @Patch('posts/:postId')
  async update(@Param('postId') postId: string, @Body(ValidationPipe) dto: UpdatePostDto, @Req() req: any) {
    try {
      return await this.socialService.updatePost(req.user.id, postId, dto);
    } catch (error: any) {
      throw new ForbiddenException(error.message);
    }
  }

  @Delete('posts/:postId')
  async remove(@Param('postId') postId: string, @Req() req: any) {
    try {
      return await this.socialService.removePost(req.user.id, postId);
    } catch (error: any) {
      throw new ForbiddenException(error.message);
    }
  }
}