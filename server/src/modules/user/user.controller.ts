import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards, NotFoundException, ConflictException } from '@nestjs/common';
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

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  // --- NOVO: Seguir / Deixar de Seguir ---
  @Post(':username/follow')
  async toggleFollow(@Param('username') username: string, @Req() req: any) {
    const targetUser = await this.prisma.user.findUnique({ where: { username } });
    if (!targetUser) throw new NotFoundException('Usuário não encontrado');

    if (targetUser.id === req.user.id) {
        throw new ConflictException("Você não pode seguir a si mesmo.");
    }

    const existingFollow = await this.prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId: targetUser.id
        }
      }
    });

    if (existingFollow) {
      await this.prisma.follows.delete({
        where: { followerId_followingId: { followerId: req.user.id, followingId: targetUser.id } }
      });
      return { status: 'unfollowed' };
    } else {
      await this.prisma.follows.create({
        data: { followerId: req.user.id, followingId: targetUser.id }
      });
      return { status: 'followed' };
    }
  }

  @Get(':username')
  async getProfile(@Param('username') username: string, @Req() req: any) {
    const user = await this.userService.findByUsername(username);
    if (!user) throw new NotFoundException('Usuário não encontrado');

    // Verifica se eu sigo
    const isFollowing = await this.prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: req.user.id,
          followingId: user.id
        }
      }
    });

    return {
      ...user,
      isFollowing: !!isFollowing,
      isMe: user.id === req.user.id
    };
  }

  @Patch('me')
  async updateProfile(@Body() dto: UpdateProfileDto, @Req() req: any) {
    return await this.userService.updateProfile(req.user.id, dto);
  }
}