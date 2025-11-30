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

  @Get('posts') 
  async findAllGlobal(@Req() req: any, @Query('type') type: string) {
    const feedType = type === 'following' ? 'following' : 'foryou';
    return this.socialService.findAllSmart(req.user.id, feedType);
  }

  // --- NOVO: BUSCAR POSTS DE UM USUÁRIO (Colocar ANTES de :postId) ---
  @Get('posts/user/:username')
  async findByUser(@Param('username') username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const posts = await this.prisma.post.findMany({
      where: { authorId: user.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, username: true, avatarUrl: true } },
        project: { select: { id: true, name: true, slug: true } },
        votes: { select: { value: true } },
        _count: { select: { comments: true } }
      }
    });

    return posts.map(post => {
        const score = post.votes.reduce((acc, curr) => acc + curr.value, 0);
        const { votes, ...rest } = post;
        return { ...rest, _count: { comments: post._count.comments, votes: score } };
    });
  }

  @Post('projects/:projectId/posts')
  async createPost(@Param('projectId') projectId: string, @Body(ValidationPipe) dto: CreatePostDto, @Req() req: any) {
    return this.socialService.createPost(dto, req.user.id, projectId);
  }

  @Get('projects/:projectId/posts')
  async findAllByProject(@Param('projectId') projectId: string) {
    return this.socialService.findAllByProject(projectId);
  }

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

  // Rota Genérica (Fica por último para não roubar a vez das outras)
  @Get('posts/:postId')
  async getPost(@Param('postId') postId: string) {
    return this.socialService.findPostById(postId);
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