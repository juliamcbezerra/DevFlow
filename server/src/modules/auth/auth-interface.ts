import { CreateUserDto, UserDto } from './dto/user.dto';

export abstract class IAuthRepository {
  abstract signup(data: CreateUserDto): Promise<UserDto>;
  abstract findByEmail(email: string): Promise<UserDto | null>;
}