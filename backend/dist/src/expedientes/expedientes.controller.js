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
exports.ExpedientesController = void 0;
const common_1 = require("@nestjs/common");
const expedientes_service_1 = require("./expedientes.service");
const expediente_dto_1 = require("./dto/expediente.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const auth_decorators_1 = require("../common/decorators/auth.decorators");
let ExpedientesController = class ExpedientesController {
    expedientesService;
    constructor(expedientesService) {
        this.expedientesService = expedientesService;
    }
    create(orgId, createExpedienteDto) {
        return this.expedientesService.create(orgId, createExpedienteDto);
    }
    findAll(orgId) {
        return this.expedientesService.findAll(orgId);
    }
    findOne(orgId, id) {
        return this.expedientesService.findOne(orgId, id);
    }
    update(orgId, id, updateExpedienteDto) {
        return this.expedientesService.update(orgId, id, updateExpedienteDto);
    }
    remove(orgId, id) {
        return this.expedientesService.remove(orgId, id);
    }
};
exports.ExpedientesController = ExpedientesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, auth_decorators_1.CurrentOrg)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, expediente_dto_1.CreateExpedienteDto]),
    __metadata("design:returntype", void 0)
], ExpedientesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, auth_decorators_1.CurrentOrg)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExpedientesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, auth_decorators_1.CurrentOrg)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ExpedientesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, auth_decorators_1.CurrentOrg)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, expediente_dto_1.UpdateExpedienteDto]),
    __metadata("design:returntype", void 0)
], ExpedientesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, auth_decorators_1.CurrentOrg)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ExpedientesController.prototype, "remove", null);
exports.ExpedientesController = ExpedientesController = __decorate([
    (0, common_1.Controller)('expedientes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [expedientes_service_1.ExpedientesService])
], ExpedientesController);
//# sourceMappingURL=expedientes.controller.js.map