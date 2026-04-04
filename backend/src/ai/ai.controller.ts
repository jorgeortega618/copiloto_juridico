import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentOrg, CurrentUser } from '../common/decorators/auth.decorators';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chatWithDocuments(
    @CurrentOrg() orgId: string,
    @CurrentUser() user: any,
    @Body('query') query: string,
    @Body('expedienteId') expedienteId?: string
  ) {
    return this.aiService.queryExpediente(orgId, user.userId, query, expedienteId);
  }
}
