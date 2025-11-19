import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator";

/**
 * @class RolesGuard
 * @description Custom guard that validates the role of the authenticated user.
 * @implements CanActivate
 * @throws ForbiddenException - If the user is not authenticated or does not have the required permissions.
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

     /**
     * @method canActivate
     * @description Checks if the user has the required roles to access the route.
     * @param context - HTTP execution context.
     * @returns true if the user has permission, otherwise throws an exception.
     */
    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass()
        ])

        if (!requiredRoles) return true;

        const { user } = context.switchToHttp().getRequest();

        if (!user) throw new ForbiddenException ('User not authenticated')

        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException ('You do not have permission to access this route')
        }
        return true;
    }
}