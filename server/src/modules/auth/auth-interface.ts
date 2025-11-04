import {CreateUserDto, SessionDto, UserDto } from './dto/user.dto';

export abstract class IAuthRepository {
  abstract signup(data: CreateUserDto): Promise<UserDto>;
  abstract signin(data: SessionDto): Promise<SessionDto>
  abstract findByEmail(email: string): Promise<UserDto | null>;
}