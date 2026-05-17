import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Spending } from './spending.entity';

@Injectable()
export class SpendingService {
  constructor(
    @InjectRepository(Spending)
    private readonly spendingRepo: Repository<Spending>,
  ) {}

  async getToday(userId: string): Promise<Spending[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.spendingRepo
      .createQueryBuilder('spending')
      .where('spending.created_at >= :today', { today })
      .andWhere('spending.user_id = :userId', { userId })
      .getMany();
  }

  async create(dto: any, userId: string): Promise<Spending> {
    const item = this.spendingRepo.create({
      category: dto.category,
      amount: dto.amount,
      icon: dto.icon,
      time: dto.time,
      period: dto.period,
      user_id: userId,
    });
    return this.spendingRepo.save(item);
  }

  async getAnalytics(userId: string): Promise<any> {
    const rows = await this.spendingRepo
      .createQueryBuilder('spending')
      .select('spending.category', 'category')
      .addSelect('spending.icon', 'icon')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(spending.amount)', 'total')
      .where('spending.user_id = :userId', { userId })
      .groupBy('spending.category')
      .addGroupBy('spending.icon')
      .orderBy('SUM(spending.amount)', 'DESC')
      .getRawMany();

    const grandTotal = rows.reduce((s, r) => s + Number(r.total), 0);
    return { total: grandTotal, by_category: rows };
  }

  async remove(id: string): Promise<void> {
    await this.spendingRepo.delete(Number(id));
  }
}
