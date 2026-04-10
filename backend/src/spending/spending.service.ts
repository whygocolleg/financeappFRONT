import { Injectable } from '@nestjs/common';

@Injectable()
export class SpendingService {
  async getToday() {
    // TODO: 오늘 소비 현황 및 절약 상태 반환
    return {};
  }

  async create(dto: any) {
    // TODO: 소비 내역 추가
    return {};
  }

  async getAnalytics(cycleDate: string) {
    // TODO: 정산 주기별 카테고리 통계 반환
    return {};
  }
}
