import { Controller, Get, Post, Delete, Body, Query, Param, UseGuards, Req } from '@nestjs/common';
import { SpendingService } from './spending.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@UseGuards(FirebaseAuthGuard)
@Controller('spending')
export class SpendingController {
  constructor(private readonly spendingService: SpendingService) {}

  // GET /api/spending/today
  @Get('today')
  getToday(@Req() req: any) {
    return this.spendingService.getToday(req.user.uid);
  }

  // POST /api/spending
  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.spendingService.create(body, req.user.uid);
  }

  // GET /api/spending/analytics
  @Get('analytics')
  getAnalytics(@Req() req: any) {
    return this.spendingService.getAnalytics(req.user.uid);
  }

  // DELETE /api/spending/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.spendingService.remove(id);
  }
}
