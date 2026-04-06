"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentOrg = exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) {
        throw new common_1.UnauthorizedException('User not found in request');
    }
    return request.user;
});
exports.CurrentOrg = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    const orgId = request.cookies?.orgId || request.headers['x-organization-id'];
    if (!orgId) {
        throw new common_1.UnauthorizedException('Organization context is missing. Please log in again.');
    }
    return orgId;
});
//# sourceMappingURL=auth.decorators.js.map