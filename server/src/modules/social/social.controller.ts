import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  ValidationPipe,
  Get,
  NotFoundException, 
  Patch,
  Delete,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { CreatePostDto } from './dto/create-post.dto';
import { VoteDto } from './dto/vote.dto'; // Se não usar no controller, pode remover
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtGuard } from '../jwt/jwt.guard';

@UseGuards(JwtGuard)
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // --- 1. FEED INTELIGENTE (Global) ---
  // Rota: GET /social/posts?type=foryou (ou following)
  @Get('posts') 
  async findAllGlobal(@Req() req: any, @Query('type') type: string) {
    // Valida o tipo, padrão é 'foryou'
    const feedType = type === 'following' ? 'following' : 'foryou';
    return this.socialService.findAllSmart(req.user.id, feedType);
  }

  // --- 2. CRIAR POST (Em Projeto) ---
  // Rota: POST /social/projects/:projectId/posts
  @Post('projects/:projectId/posts')
  async createPost(
    @Param('projectId') projectId: string, 
    @Body(ValidationPipe) dto: CreatePostDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.socialService.createPost(dto, userId, projectId);
  }

  // --- 3. FEED DO PROJETO ---
  @Get('projects/:projectId/posts')
  async findAllByProject(@Param('projectId') projectId: string) {
    return this.socialService.findAllByProject(projectId);
  }

  // --- 4. VOTAR ---
  @Post('vote')
  async vote(@Body() body: { postId: string; value: number }, @Req() req: any) {
    const safeValue = body.value > 0 ? 1 : -1;
    // O service espera um objeto VoteDto, então adaptamos aqui
    return this.socialService.toggleVote(req.user.id, body.postId, { value: safeValue });
  }

  // --- 5. COMENTÁRIOS ---
  @Post('posts/:postId/comments')
  async createComment(
    @Param('postId') postId: string,
    @Body(ValidationPipe) dto: CreateCommentDto,
    @Req() req: any,
  ) {
    return this.socialService.createComment(req.user.id, postId, dto);
  }

  @Get('posts/:postId/comments')
  async getComments(@Param('postId') postId: string) {
    return this.socialService.getCommentsTree(postId);
  }

  // --- 6. POST INDIVIDUAL ---
  @Get('posts/:postId')
  async getPost(@Param('postId') postId: string) {
    const post = await this.socialService.findPostById(postId);
    if (!post) throw new NotFoundException('Post não encontrado.');
    return post;
  }

  @Patch('posts/:postId')
  async update(
    @Param('postId') postId: string,
    @Body(ValidationPipe) dto: UpdatePostDto,
    @Req() req: any,
  ) {
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