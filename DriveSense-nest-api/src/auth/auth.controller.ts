import { Body, Controller, Post, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtAuthGuard } from './jwt.guard';

/**
 * @class AuthController
 * @description Controller to handle user authentication (registration, login, and profile).
 * @route /auth
 */
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

     /**
     * @method register
     * @description Registers a new user.
     * @route POST /auth/register
     * @param data - User data to register.
     */
    @Post('register')
    register(@Body() data: CreateUserDto) {
        return this.authService.register(data);
    }

    /**
     * @method login
     * @description Logs in a user with credentials.
     * @route POST /auth/login
     * @param data - Access credentials.
     */
    @Post('login')
    login(@Body() data: LoginDTO) {
        return this.authService.login(data);
    }

    /**
     * @method getProfile
     * @description Gets the authenticated user's profile via JWT.
     * @route GET /auth/profile
     * @guard JwtAuthGuard
     * @returns Authenticated user information.
     */
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}