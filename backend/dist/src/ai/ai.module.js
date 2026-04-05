"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("./ai.service");
const ai_controller_1 = require("./ai.controller");
const bullmq_1 = require("@nestjs/bullmq");
const ai_processor_1 = require("./ai.processor");
const prisma_module_1 = require("../prisma/prisma.module");
const events_module_1 = require("../events/events.module");
let AiModule = class AiModule {
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            bullmq_1.BullModule.registerQueue({
                name: 'ai-processing',
            }),
            events_module_1.EventsModule
        ],
        providers: [ai_service_1.AiService, ai_processor_1.AiProcessor],
        controllers: [ai_controller_1.AiController],
        exports: [ai_service_1.AiService, bullmq_1.BullModule]
    })
], AiModule);
//# sourceMappingURL=ai.module.js.map