import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Initializing Copiloto Juridico Seeder ---');

  // 1. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'StatusLaw Partners',
    },
  });
  console.log(`Created Organization: ${org.name}`);

  // 2. Create User (Lawyer)
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

  // 3. Link User to Organization
  await prisma.organizationUser.create({
    data: {
      orgId: org.id,
      userId: user.id,
    },
  });
  console.log('Linked User to Organization');

  // 4. Create Clients
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

  // 5. Create Expedientes
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
