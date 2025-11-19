import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * @class JwtStrategy
 * @description Passport strategy to validate JWT tokens.
 * @extends PassportStrategy
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET_KEY') || ''
        });
    }

    /**
     * @method validate
     * @description Returns the JWT payload data after verification.
     * @param payload - Information contained in the JWT token.
     * @returns Object with the user's basic data.
     */
    async validate(payload: any) {
        return { id: payload.sub, email: payload.email, role: payload.role};
    }

}
