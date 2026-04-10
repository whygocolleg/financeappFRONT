import { Injectable } from '@nestjs/common';

@Injectable()
export class GoalsService {
  async findAll() {
    // TODO: 유저의 목표 목록 반환
    return [];
  }

  async create(dto: any) {
    // TODO: 신규 목표 생성
    return {};
  }

  async findOne(id: string) {
    // TODO: 목표 상세 + 절약 통계 반환
    return {};
  }
}
