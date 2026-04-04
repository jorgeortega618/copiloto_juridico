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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpedientesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ExpedientesService = class ExpedientesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(orgId, dto) {
        return this.prisma.expediente.create({
            data: { ...dto, orgId },
        });
    }
    async findAll(orgId) {
        return this.prisma.expediente.findMany({
            where: { orgId },
            include: { client: true }
        });
    }
    async findOne(orgId, id) {
        const exp = await this.prisma.expediente.findFirst({
            where: { id, orgId },
            include: {
                client: true,
                tasks: true,
                documents: true,
            }
        });
        if (!exp)
            throw new common_1.NotFoundException('Expediente not found');
        return exp;
    }
    async update(orgId, id, dto) {
        await this.findOne(orgId, id);
        return this.prisma.expediente.update({
            where: { id },
            data: dto,
        });
    }
    async remove(orgId, id) {
        await this.findOne(orgId, id);
        return this.prisma.expediente.delete({
            where: { id },
        });
    }
};
exports.ExpedientesService = ExpedientesService;
exports.ExpedientesService = ExpedientesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExpedientesService);
//# sourceMappingURL=expedientes.service.js.map