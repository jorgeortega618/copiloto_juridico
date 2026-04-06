import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) {
      throw new UnauthorizedException('User not found in request');
    }
    return request.user;
  },
);

export const CurrentOrg = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    // Priority: Cookie (secure) → Header (backward compat for API clients)
    const orgId = request.cookies?.orgId || request.headers['x-organization-id'];
    
    if (!orgId) {
      throw new UnauthorizedException('Organization context is missing. Please log in again.');
    }
    
    return orgId;
  },
);
