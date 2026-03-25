import { Controller, Post, Get, Param, Query, UseGuards } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('tracking')
@UseGuards(JwtAuthGuard)
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post(':routineId/toggle')
  async toggle(
    @CurrentUser('id') userId: string,
    @Param('routineId') routineId: string,
  ) {
    const data = await this.trackingService.toggle(userId, routineId);
    return { success: true, data };
  }

  @Get()
  async getByDate(
    @CurrentUser('id') userId: string,
    @Query('date') date: string,
  ) {
    const data = await this.trackingService.getByDate(userId, date);
    return { success: true, data };
  }
}
