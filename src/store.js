import { STORAGE_KEY, SETTINGS_KEY, DEFAULT_SETTINGS, USE_BACKEND } from './config.js';
import { goalsApi }   from './api/goals.api.js';
import { spendingApi } from './api/spending.api.js';

// 메모리 캐시 (렌더링용 동기 읽기)
let _data     = { goals: [], expected_spending: [], analytics: null };
let _settings = null;

// ── 비동기 초기화 ─────────────────────────────────────
// fallback: mock 모드에서 localStorage가 비어있을 때 seed 데이터
export async function initData(fallback) {
    if (!USE_BACKEND && fallback) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
        }
    }
    const [goals, spending, analytics] = await Promise.all([
        goalsApi.getAll(),
        spendingApi.getToday(),
        spendingApi.getAnalytics(),
    ]);
    _data = { goals, expected_spending: spending, analytics };
    return _data;
}

// ── 동기 캐시 읽기/쓰기 ──────────────────────────────
export function getData()         { return _data; }
export function setCache(updates) { _data = { ..._data, ...updates }; }

// ── 설정 (localStorage 유지) ──────────────────────────
export function loadSettings() {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (saved) {
            _settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
            return _settings;
        }
    } catch (_) {}
    _settings = { ...DEFAULT_SETTINGS };
    return _settings;
}

export function getSettings() { return _settings || loadSettings(); }

export function saveSettings(updates) {
    _settings = { ..._settings, ...updates };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(_settings));
    return _settings;
}

export function clearSettings() {
    localStorage.removeItem(SETTINGS_KEY);
    _settings = null;
}
