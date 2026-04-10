import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { SpendingService } from './spending.service';

@Controller('spending')
export class SpendingController {
  constructor(private readonly spendingService: SpendingService) {}

  // GET /api/spending/today
  @Get('today')
  getToday() {
    return this.spendingService.getToday();
  }

  // POST /api/spending
  @Post()
  create(@Body() body: any) {
    return this.spendingService.create(body);
  }

  // GET /api/spending/analytics
  @Get('analytics')
  getAnalytics(@Query('cycleDate') cycleDate: string) {
    return this.spendingService.getAnalytics(cycleDate);
  }
}
