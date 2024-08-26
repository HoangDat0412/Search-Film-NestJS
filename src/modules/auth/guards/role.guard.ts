import { CanActivate, ExecutionContext } from "@nestjs/common";

export class RoleGuard implements CanActivate {

    constructor(private roles: string[]) {}

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        return this.roles.includes(request.user_data.role)
    }
}