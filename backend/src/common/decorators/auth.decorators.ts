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
    const orgId = request.headers['x-organization-id'];
    
    // In a mature system, here we would also verify if request.user is allowed in orgId!
    // For this MVP, we enforce it minimally or extract from header directly.
    if (!orgId) {
      throw new UnauthorizedException('Header X-Organization-Id is missing or invalid');
    }
    
    return orgId;
  },
);
