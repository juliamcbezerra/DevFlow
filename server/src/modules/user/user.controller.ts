import { Body, Controller, Get, Param, Patch, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { JwtGuard } from '../jwt/jwt.guard'; 
import { UserService } from './user.service';
import { UpdateInterestsDto } from './dto/update-interests.dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Atualizar Interesses
  @Patch('me/interests')
  async updateInterests(@Body() dto: UpdateInterestsDto, @Req() req: any) {
    return await this.userService.updateInterests(req.user.id, dto);
  }

  // Listar Comunidade
  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  // Ver Perfil Específico (Ex: /users/diego3g)
  @Get(':username')
  async getProfile(@Param('username') username: string) {
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }
}