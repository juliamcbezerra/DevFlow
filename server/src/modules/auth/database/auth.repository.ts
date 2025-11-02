import { ConflictException, Injectable } from '@nestjs/common';
import { IAuthRepository } from '../auth-interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto, UserDto } from '../dto/user.dto';
import { hash } from 'bcrypt';

@Injectable()
export class PrismaAuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

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

  async findByEmail(email: string): Promise<UserDto | null> {
    const user = await this.prisma.user.findUnique({
      where: {email},
    });

    return user;
  }
}