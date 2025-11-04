import { ConflictException, Injectable } from '@nestjs/common';
import { IAuthRepository } from '../auth-interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, SessionDto, UserDto } from '../dto/user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PrismaAuthRepository implements IAuthRepository {
  constructor(
    private readonly prisma: PrismaService, 
    private jwtService: JwtService
  ) {}

  async signup(data: CreateUserDto): Promise<UserDto> {
    const {email, password, name} = data;

    const user = await this.prisma.user.create({
      data: {
        email,
        name,
        password,
      }
    })

    return user;
  }

  async signin(data: SessionDto): Promise<SessionDto> {
    const { userId, accessToken, refreshToken } = data;

    await this.prisma.session.create({ 
        data: {
          userId: userId,
          accessToken: accessToken, 
          refreshToken: refreshToken,
        }
    });

    return { userId: userId, accessToken, refreshToken };
  }

  async findByEmail(email: string): Promise<UserDto | null> {
    const user = await this.prisma.user.findUnique({
      where: {email},
    });

    return user;
  }
}