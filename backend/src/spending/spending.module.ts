import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpendingController } from './spending.controller';
import { SpendingService } from './spending.service';
import { Spending } from './spending.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Spending])],
  controllers: [SpendingController],
  providers: [SpendingService],
  exports: [SpendingService],
})
export class SpendingModule {}
