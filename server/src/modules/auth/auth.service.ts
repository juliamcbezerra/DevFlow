import { Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from 'src/modules/auth/dto/user.dto';
import * as bcrypt from 'bcrypt';
import { IAuthRepository } from './auth-interface';

@Injectable()
export class AuthService {
    constructor(private auth: IAuthRepository) {}

        // @param

    async signUp(data: CreateUserDto) {
        // 1. Checar se o usuário já existe
        const userExists = await this.auth.findByEmail(data.email);

        if (userExists) {
            throw new ConflictException('Email já cadastrado');
        }

        // 2. Hashear a senha (Implementando AUTH-03)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        // 3. Substituir senha original pela hasheada
        const newUserData = {...data, password: hashedPassword};

        // 4. Salvar o novo usuário no banco
        const user = await this.auth.signup(newUserData);

        // 5. Retornar o usuário criado (sem a senha)
        const { password, ...result } = user;
        
        return result;
    }
}