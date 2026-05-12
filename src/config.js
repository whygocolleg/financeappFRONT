/*
 * USE_BACKEND = false  → localStorage + mockData (개발/목 모드)
 * USE_BACKEND = true   → 백엔드 REST API + JWT
 *
 * 백엔드 연동 시 아래 한 줄만 true로 바꾸면 됩니다.
 */
export const USE_BACKEND = false;

export const API_BASE_URL = 'http://localhost:3000';

export const STORAGE_KEY      = 'financeData';
export const SETTINGS_KEY     = 'financeSettings';
export const SLIDE_DURATION   = 380;

export const DEFAULT_SETTINGS = {
    today_budget: 30000,
    billing_day:  25,
    user_name:    '',
};
