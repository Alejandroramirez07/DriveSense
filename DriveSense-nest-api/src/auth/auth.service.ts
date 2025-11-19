import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { EmailDuplicateException } from 'src/common/exceptions/users/email-duplicate.exception';

/**
 * @class AuthService
 * @description Service that handles user registration, authentication, and JWT token generation.
 */
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
        private jwtService: JwtService,
    ) { }

    /**
     * @method register
     * @description Registers a new user by hashing their password.
     * @param data - User data to register.
     * @returns Confirmation message and basic data of the created user.
     */
   async register(data: CreateUserDto) {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const userCreated = this.userRepo.create({
      ...data,
      role: data.role ?? 'user',
      password: hashedPassword,
    });

    await this.userRepo.save(userCreated);

    return {
      message: 'User registered successfully',
      user: {
        id: userCreated.id,
        email: userCreated.email,
      },
    };

  } catch (error) {
   
    if (error.code === 'ER_DUP_ENTRY') {
      throw new EmailDuplicateException(); 
    }

    
    throw new Error('Unexpected error during registration');
  }
}


    /**
     * @method login
     * @description Validates credentials and generates JWT token.
     * @param data - Login credentials.
     * @returns JWT access token.
     * @throws UnauthorizedException - If credentials are invalid.
     */
    async login(data: LoginDTO) {
        const user = await this.userRepo.findOne({ where: { email: data.email } });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const payloadToken = { sub: user.id, email: user.email, name: user.name, role: user.role };
        const token = await this.jwtService.signAsync(payloadToken);

        return { accessToken: token }

    }
}
