import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './goal.entity';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepo: Repository<Goal>,
  ) {}

  async findAll(userId: string): Promise<Goal[]> {
    return this.goalRepo.find({ where: { user_id: userId } });
  }

  async create(dto: any, userId: string): Promise<Goal> {
    const goal = this.goalRepo.create({
      name: dto.name,
      target_amount: dto.target_amount,
      current_amount: 0,
      endDate: dto.endDate,
      user_id: userId,
    });
    return this.goalRepo.save(goal);
  }

  async findOne(id: string): Promise<Goal> {
    return this.goalRepo.findOne({ where: { id: Number(id) } });
  }

  async remove(id: string): Promise<void> {
    await this.goalRepo.delete(Number(id));
  }
}
