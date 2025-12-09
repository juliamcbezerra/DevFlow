import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards, Query } from '@nestjs/common';
import { JwtGuard } from '../jwt/jwt.guard'; 
import { UserService } from './user.service';
import { UpdateInterestsDto } from './dto/update-interests.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('me/interests')
  async updateInterests(@Body() dto: UpdateInterestsDto, @Req() req: any) {
    return await this.userService.updateInterests(req.user.id, dto);
  }

  @Patch('me')
  async updateProfile(@Body() dto: UpdateProfileDto, @Req() req: any) {
    return await this.userService.updateProfile(req.user.id, dto);
  }

  @Get()
  async findAll(@Req() req: any, @Query('type') type: 'following' | 'foryou') {
    // Passa a responsabilidade para o Service
    return this.userService.findAllCommunity(req.user.id, type || 'foryou');
  }

  @Get(':username')
  async getProfile(@Param('username') username: string, @Req() req: any) {
    // O Service já calcula o 'isFollowing' e 'isMe' se passarmos o ID do usuário logado
    return this.userService.findByUsername(username, req.user.id);
  }

  // --- A CORREÇÃO MÁGICA ESTÁ AQUI ---
  @Post(':username/follow')
  async toggleFollow(@Param('username') username: string, @Req() req: any) {
    // Em vez de fazer a lógica do banco aqui, chamamos o Service.
    // O Service vai salvar no banco E enviar a notificação.
    return this.userService.toggleFollow(req.user.id, username);
  }

  @Get(':username/followers')
  async getFollowers(@Param('username') username: string) {
    return this.userService.getFollowers(username);
  }

  @Get(':username/following')
  async getFollowing(@Param('username') username: string) {
    return this.userService.getFollowing(username);
  }
}