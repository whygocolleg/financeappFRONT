import { USE_BACKEND, AUTH_MODE } from '../config.js';
import { http, setToken, clearToken } from './client.js';

/*
 * ── 자체 JWT 방식 (AUTH_MODE = 'custom-jwt') ─────────────────────────────
 * 백엔드 /api/auth/signup, /api/auth/signin 엔드포인트에서 JWT를 발급받아 저장.
 * auth.js의 Firebase 의존성을 제거하고 이 객체의 signin/signup을 직접 호출하도록 변경.
 */
const customJwtAuth = {
    signup: async dto => {
        const res = await http.post('/api/auth/signup', dto);
        if (res?.access_token) setToken(res.access_token);
        return res;
    },
    signin: async dto => {
        const res = await http.post('/api/auth/signin', dto);
        if (res?.access_token) setToken(res.access_token);
        return res;
    },
    signout: () => clearToken(),
};

/*
 * ── Firebase ID 토큰 방식 (AUTH_MODE = 'firebase') ────────────────────────
 * 로그인/회원가입은 auth.js의 Firebase UI가 처리.
 * 토큰 주입은 auth.js의 onIdTokenChanged에서 자동으로 setToken() 호출.
 * 이 객체는 로그아웃 시 토큰 정리만 담당.
 */
const firebaseAuth = {
    signup:  async () => { /* Firebase UI에서 처리 */ },
    signin:  async () => { /* Firebase UI에서 처리 */ },
    signout: () => clearToken(),
};

export const backendAuthApi = USE_BACKEND
    ? (AUTH_MODE === 'custom-jwt' ? customJwtAuth : firebaseAuth)
    : null; // mock 모드에서는 사용하지 않음
