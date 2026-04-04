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
    const orgId = request.headers['x-organization-id'];
    if (!orgId) {
        throw new common_1.UnauthorizedException('Header X-Organization-Id is missing or invalid');
    }
    return orgId;
});
//# sourceMappingURL=auth.decorators.js.map