"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const documents_service_1 = require("./documents.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const auth_decorators_1 = require("../common/decorators/auth.decorators");
let DocumentsController = class DocumentsController {
    documentsService;
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    uploadDocument(orgId, user, expedienteId, file, title) {
        if (!file) {
            throw new common_1.BadRequestException('File is required');
        }
        return this.documentsService.uploadDocument(orgId, expedienteId, user.userId, file, title);
    }
    findAllByExpediente(orgId, expedienteId) {
        return this.documentsService.findAllByExpediente(orgId, expedienteId);
    }
    getDocumentUrl(orgId, id) {
        return this.documentsService.getDocumentUrl(orgId, id);
    }
};
exports.DocumentsController = DocumentsController;
__decorate([
    (0, common_1.Post)(':expedienteId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, auth_decorators_1.CurrentOrg)()),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __param(2, (0, common_1.Param)('expedienteId')),
    __param(3, (0, common_1.UploadedFile)()),
    __param(4, (0, common_1.Body)('title')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, Object, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Get)('expediente/:expedienteId'),
    __param(0, (0, auth_decorators_1.CurrentOrg)()),
    __param(1, (0, common_1.Param)('expedienteId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "findAllByExpediente", null);
__decorate([
    (0, common_1.Get)(':id/url'),
    __param(0, (0, auth_decorators_1.CurrentOrg)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], DocumentsController.prototype, "getDocumentUrl", null);
exports.DocumentsController = DocumentsController = __decorate([
    (0, common_1.Controller)('documents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [documents_service_1.DocumentsService])
], DocumentsController);
//# sourceMappingURL=documents.controller.js.map