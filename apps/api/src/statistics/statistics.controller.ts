import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('today')
  async getToday(@CurrentUser('id') userId: string) {
    const data = await this.statisticsService.getToday(userId);
    return { success: true, data };
  }

  @Get('weekly')
  async getWeekly(@CurrentUser('id') userId: string) {
    const data = await this.statisticsService.getWeekly(userId);
    return { success: true, data };
  }

  @Get('monthly')
  async getMonthly(
    @CurrentUser('id') userId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const data = await this.statisticsService.getMonthly(userId, parseInt(year), parseInt(month));
    return { success: true, data };
  }

  @Get('streak')
  async getStreak(@CurrentUser('id') userId: string) {
    const data = await this.statisticsService.getStreak(userId);
    return { success: true, data };
  }
}
