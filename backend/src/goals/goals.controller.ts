import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { GoalsService } from './goals.service';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  // GET /api/goals
  @Get()
  findAll() {
    return this.goalsService.findAll();
  }

  // POST /api/goals
  @Post()
  create(@Body() body: any) {
    return this.goalsService.create(body);
  }

  // GET /api/goals/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.goalsService.findOne(id);
  }
}
