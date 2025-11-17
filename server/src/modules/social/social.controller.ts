// server/src/modules/social/social.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  ValidationPipe,
  Get,  
} from '@nestjs/common';
import { SocialService } from './social.service';
import { CreatePostDto } from './dto/create-post.dto';
import { VoteDto } from './dto/vote.dto';
import { JwtGuard } from '../jwt/jwt.guard';

@Controller('projects') // Prefixo 'projects' para seguir a hierarquia REST
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  /**
   * SOC-01: Criar um Post num Projeto
   * Rota: POST /projects/:projectId/posts
   */
  @UseGuards(JwtGuard)
  @Post(':projectId/posts')
  async createPost(
    @Param('projectId') projectId: string, // Pega o ID da URL
    @Body(ValidationPipe) dto: CreatePostDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.socialService.createPost(dto, userId, projectId);
  }

  /**
   * SOC-02: Ver o Feed de Posts
   * Rota: GET /projects/:projectId/posts
   */
  @UseGuards(JwtGuard) // Opcional: Se quiser que o feed seja público, remova esta linha
  @Get(':projectId/posts')
  async findAll(@Param('projectId') projectId: string) {
    return this.socialService.findAllByProject(projectId);
  }

/**
   * SOC-10: Votar num Post
   * Rota: POST /posts/:postId/vote
   */
  @UseGuards(JwtGuard)
  @Post('posts/:postId/vote') // Note que a rota começa em 'posts', não 'projects'
  async vote(
    @Param('postId') postId: string,
    @Body(ValidationPipe) dto: VoteDto,
    @Req() req: any,
  ) {
    return this.socialService.toggleVote(req.user.id, postId, dto);
  }
}