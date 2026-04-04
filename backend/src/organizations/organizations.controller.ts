import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/auth.decorators';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Post()
  async createOrg(@Body() body: any, @CurrentUser() user: any) {
    // In a real app we would create org via orgService, then attach user as owner,
    // but register already does this. This is for adding extra orgs.
    return { message: 'Org creation', userId: user.userId };
  }

  @Get(':id')
  async getOrg(@Param('id') id: string, @CurrentUser() user: any) {
    // Return organization details
    return { id, message: 'Get org details', accessedBy: user.userId };
  }
}
