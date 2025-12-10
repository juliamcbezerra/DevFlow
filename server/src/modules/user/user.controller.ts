// server/src/modules/user/user.controller.ts (Arquivo completo e corrigido)

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

  @Patch('me/onboarding')
  async finishOnboarding(@Body() dto: UpdateProfileDto, @Req() req: any) {
    return await this.userService.finishOnboarding(req.user.id, dto);
  }
    
  @Get()
  async findAll(@Req() req: any, @Query('type') type: 'following' | 'foryou') {
    return this.userService.findAllCommunity(req.user.id, type || 'foryou');
  }

  @Get(':username')
  async getProfile(@Param('username') username: string, @Req() req: any) {
    return this.userService.findByUsername(username, req.user.id);
  }

  @Post(':username/follow')
  async toggleFollow(@Param('username') username: string, @Req() req: any) {
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