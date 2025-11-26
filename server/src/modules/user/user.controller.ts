import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../jwt/jwt.guard';
import { UserService } from './user.service';
import { UpdateInterestsDto } from './dto/update-interests.dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('me/interests')
  async updateInterests(@Body() dto: UpdateInterestsDto, @Req() req: any) {
    const user = await this.userService.updateInterests(req.user.id, dto);
    return user;
  }
}