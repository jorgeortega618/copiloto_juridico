"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const organizations_module_1 = require("./organizations/organizations.module");
const clients_module_1 = require("./clients/clients.module");
const expedientes_module_1 = require("./expedientes/expedientes.module");
const tasks_module_1 = require("./tasks/tasks.module");
const storage_module_1 = require("./storage/storage.module");
const documents_module_1 = require("./documents/documents.module");
const parser_module_1 = require("./parser/parser.module");
const bullmq_1 = require("@nestjs/bullmq");
const ai_module_1 = require("./ai/ai.module");
const events_module_1 = require("./events/events.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.forRoot({
                connection: {
                    host: process.env.REDIS_HOST || '127.0.0.1',
                    port: parseInt(process.env.REDIS_PORT || '6379'),
                },
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            organizations_module_1.OrganizationsModule,
            clients_module_1.ClientsModule,
            expedientes_module_1.ExpedientesModule,
            tasks_module_1.TasksModule,
            storage_module_1.StorageModule,
            documents_module_1.DocumentsModule,
            parser_module_1.ParserModule, ai_module_1.AiModule, events_module_1.EventsModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map