"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('--- Initializing Copiloto Juridico Seeder ---');
    const org = await prisma.organization.create({
        data: {
            name: 'StatusLaw Partners',
        },
    });
    console.log(`Created Organization: ${org.name}`);
    const passwordHash = await bcrypt.hash('123456', 10);
    const user = await prisma.user.create({
        data: {
            email: 'demo@abogados.com',
            passwordHash,
            firstName: 'Erick',
            lastName: 'Rowan',
        },
    });
    console.log(`Created User: ${user.email}`);
    await prisma.organizationUser.create({
        data: {
            orgId: org.id,
            userId: user.id,
        },
    });
    console.log('Linked User to Organization');
    const client1 = await prisma.client.create({
        data: {
            orgId: org.id,
            name: 'Corporación Wayne',
            email: 'legal@wayne.com',
            phone: '555-1234',
            documentId: 'V-12345678',
        },
    });
    const client2 = await prisma.client.create({
        data: {
            orgId: org.id,
            name: 'Juan Pérez',
            email: 'juan.perez@gmail.com',
            phone: '555-9876',
            documentId: '12345678-9',
        },
    });
    console.log(`Created Clients: ${client1.name}, ${client2.name}`);
    const exp1 = await prisma.expediente.create({
        data: {
            orgId: org.id,
            clientId: client1.id,
            title: 'Auditoría Fiscal Anual',
            description: 'Defensa ante la administración de ingresos públicos.',
            status: 'OPEN',
        },
    });
    const exp2 = await prisma.expediente.create({
        data: {
            orgId: org.id,
            clientId: client2.id,
            title: 'Demanda Laboral por Despido',
            description: 'Representación del trabajador contra su antigua contratista.',
            status: 'PENDING',
        },
    });
    console.log(`Created Expedientes: ${exp1.title}, ${exp2.title}`);
    console.log('--- Seeding Completed Successfully ---');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map