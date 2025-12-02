import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards, NotFoundException, ConflictException, Query } from '@nestjs/common';
import { JwtGuard } from '../jwt/jwt.guard'; 
import { UserService } from './user.service';
import { UpdateInterestsDto } from './dto/update-interests.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from '../../prisma/prisma.service'; 

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService 
  ) {}

  @Patch('me/interests')
  async updateInterests(@Body() dto: UpdateInterestsDto, @Req() req: any) {
    return await this.userService.updateInterests(req.user.id, dto);
  }

  @Patch('me')
  async updateProfile(@Body() dto: UpdateProfileDto, @Req() req: any) {
    return await this.userService.updateProfile(req.user.id, dto);
  }

  @Get()
  async findAll(@Req() req: any, @Query('type') type: string) {
    const listType = type === 'following' ? 'following' : 'foryou';
    return this.userService.findAllCommunity(req.user.id, listType);
  }

  @Get(':username')
  async getProfile(@Param('username') username: string, @Req() req: any) {
    const user = await this.userService.findByUsername(username);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const isFollowing = await this.prisma.follows.findUnique({
      where: { followerId_followingId: { followerId: req.user.id, followingId: user.id } }
    });

    return { ...user, isFollowing: !!isFollowing, isMe: user.id === req.user.id };
  }

  // --- CORREÇÃO AQUI NO TOGGLE FOLLOW ---
  @Post(':username/follow')
  async toggleFollow(@Param('username') username: string, @Req() req: any) {
    const targetUser = await this.prisma.user.findUnique({ where: { username } });
    if (!targetUser) throw new NotFoundException('Usuário não encontrado');
    if (targetUser.id === req.user.id) throw new ConflictException("Você não pode seguir a si mesmo.");

    const existingFollow = await this.prisma.follows.findUnique({
      where: { followerId_followingId: { followerId: req.user.id, followingId: targetUser.id } }
    });

    if (existingFollow) {
      // CORREÇÃO: Usamos a chave composta para deletar
      await this.prisma.follows.delete({
        where: { 
            followerId_followingId: { 
                followerId: req.user.id, 
                followingId: targetUser.id 
            } 
        }
      });
      return { status: 'unfollowed' };
    } else {
      await this.prisma.follows.create({ data: { followerId: req.user.id, followingId: targetUser.id } });
      return { status: 'followed' };
    }
  }
}