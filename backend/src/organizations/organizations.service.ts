import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeam(orgId: string) {
    const orgUsers = await this.prisma.organizationUser.findMany({
      where: { orgId },
      include: {
        user: true,
      },
    });
    return orgUsers.map(ou => ou.user);
  }

  async addTeamMember(orgId: string, email: string, firstName: string, lastName: string) {
    // Check if user exists
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Create user with default password 'Abogio2026'
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('Abogio2026', salt);
      user = await this.prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          passwordHash: hash,
        },
      });
    }

    // Check if already in org
    const exists = await this.prisma.organizationUser.findUnique({
      where: { orgId_userId: { orgId, userId: user.id } }
    });
    
    if (exists) {
      throw new BadRequestException('User is already in this organization');
    }

    // Add to org
    await this.prisma.organizationUser.create({
      data: {
        orgId,
        userId: user.id,
      }
    });

    return user;
  }
}
