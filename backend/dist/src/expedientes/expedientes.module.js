"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpedientesModule = void 0;
const common_1 = require("@nestjs/common");
const expedientes_service_1 = require("./expedientes.service");
const expedientes_controller_1 = require("./expedientes.controller");
let ExpedientesModule = class ExpedientesModule {
};
exports.ExpedientesModule = ExpedientesModule;
exports.ExpedientesModule = ExpedientesModule = __decorate([
    (0, common_1.Module)({
        providers: [expedientes_service_1.ExpedientesService],
        controllers: [expedientes_controller_1.ExpedientesController]
    })
], ExpedientesModule);
//# sourceMappingURL=expedientes.module.js.map