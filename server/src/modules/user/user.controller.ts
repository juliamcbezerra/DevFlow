import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../jwt/jwt.guard'; // Ajuste o caminho se necessário (ex: ../jwt/jwt.guard)
import { UserService } from './user.service';
import { UpdateInterestsDto } from './dto/update-interests.dto';

@UseGuards(JwtGuard) // Protege todas as rotas abaixo
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('me/interests')
  async updateInterests(@Body() dto: UpdateInterestsDto, @Req() req: any) {
    // req.user.id vem do JwtStrategy (que extraiu do cookie)
    return await this.userService.updateInterests(req.user.id, dto);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }
}