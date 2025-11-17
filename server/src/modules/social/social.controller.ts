// server/src/modules/social/social.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { SocialService } from './social.service';
import { CreatePostDto } from './dto/create-post.dto';
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
}