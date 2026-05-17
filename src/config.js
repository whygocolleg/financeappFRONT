/*
 * USE_BACKEND = false  → localStorage + mockData (개발/목 모드)
 * USE_BACKEND = true   → 백엔드 REST API + JWT
 *
 * 백엔드 연동 시 아래 한 줄만 true로 바꾸면 됩니다.
 */
export const USE_BACKEND = true;

export const API_BASE_URL = 'http://localhost:3000';

/*
 * AUTH_MODE (USE_BACKEND = true 일 때만 적용)
 *
 *   'firebase'   → Firebase ID 토큰을 Authorization 헤더에 자동 주입
 *                  백엔드에서 Firebase Admin SDK로 토큰을 검증하는 방식
 *
 *   'custom-jwt' → 백엔드 /api/auth/signin 에서 발급한 JWT를 사용
 *                  Firebase 의존성 없이 자체 로그인 엔드포인트로 전환
 *
 * 조원과 백엔드 인증 방식 확정 후 아래 값을 변경하세요.
 */
export const AUTH_MODE = 'firebase'; // 'firebase' | 'custom-jwt'

export const STORAGE_KEY      = 'financeData';
export const SETTINGS_KEY     = 'financeSettings';
export const SLIDE_DURATION   = 380;

export const DEFAULT_SETTINGS = {
    today_budget: 30000,
    billing_day:  25,
    user_name:    '',
};
