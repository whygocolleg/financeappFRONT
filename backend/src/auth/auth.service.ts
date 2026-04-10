import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async signup(dto: any) {
    // TODO: 회원가입 구현
    return {};
  }

  async signin(dto: any) {
    // TODO: 로그인 및 JWT 발급 구현
    return {};
  }
}
