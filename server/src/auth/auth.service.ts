import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService} from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}

        // @param

    async signUp(dto: CreateUserDto) {
        // 1. Checar se o usuário já existe
        const userExists = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });

        if (userExists) {
            throw new ConflictException('Email já cadastrado');
        }

        // 2. Hashear a senha (Implementando AUTH-03)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

        // 3. Salvar o novo usuário no banco
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                password: hashedPassword,
            },
        });

        // 4. Retornar o usuário criado (sem a senha)
        const { password, ...result } = user;
        return result;
    }
}