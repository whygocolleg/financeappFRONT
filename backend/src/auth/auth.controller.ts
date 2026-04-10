import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /api/auth/signup
  @Post('signup')
  signup(@Body() body: any) {
    return this.authService.signup(body);
  }

  // POST /api/auth/signin
  @Post('signin')
  signin(@Body() body: any) {
    return this.authService.signin(body);
  }
}
