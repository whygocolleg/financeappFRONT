import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';

@UseGuards(FirebaseAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  // GET /api/goals
  @Get()
  findAll(@Req() req: any) {
    return this.goalsService.findAll(req.user.uid);
  }

  // POST /api/goals
  @Post()
  create(@Body() body: any, @Req() req: any) {
    return this.goalsService.create(body, req.user.uid);
  }

  // GET /api/goals/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.goalsService.findOne(id);
  }

  // DELETE /api/goals/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.goalsService.remove(id);
  }
}
