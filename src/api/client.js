import { API_BASE_URL } from '../config.js';

const TOKEN_KEY = 'finance_jwt';

export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function setToken(token) { localStorage.setItem(TOKEN_KEY, token); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); }

async function request(method, path, body) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res;
    try {
        res = await fetch(`${API_BASE_URL}${path}`, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw Object.assign(
            new Error('네트워크에 연결할 수 없어요. 인터넷 연결을 확인해주세요.'),
            { status: 0 }
        );
    }

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.message || `서버 오류 (${res.status})`;
        throw Object.assign(new Error(msg), { status: res.status, body: err });
    }

    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

export const http = {
    get:    path        => request('GET',    path),
    post:   (path, dto) => request('POST',   path, dto),
    patch:  (path, dto) => request('PATCH',  path, dto),
    delete: path        => request('DELETE', path),
};
