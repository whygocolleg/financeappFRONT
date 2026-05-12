import { USE_BACKEND, STORAGE_KEY } from '../config.js';
import { http } from './client.js';

// ── Mock 유틸 ─────────────────────────────────────────
const _delay = (ms = 80) => new Promise(r => setTimeout(r, ms));

function _readStore() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { goals: [], expected_spending: [] }; }
    catch { return { goals: [], expected_spending: [] }; }
}
function _writeStore(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function _nextId(arr) { return arr.reduce((max, i) => Math.max(max, i.id || 0), 0) + 1; }

// ── Mock 구현 ─────────────────────────────────────────
const mockSpending = {
    getToday: async () => {
        await _delay();
        return _readStore().expected_spending;
    },

    create: async dto => {
        await _delay();
        const store = _readStore();
        const item  = { id: _nextId(store.expected_spending), ...dto };
        store.expected_spending.push(item);
        _writeStore(store);
        return item;
    },

    delete: async id => {
        await _delay();
        const store = _readStore();
        store.expected_spending = store.expected_spending.filter(i => i.id !== id);
        _writeStore(store);
    },

    getAnalytics: async () => {
        await _delay();
        const store = _readStore();
        return store.goals.map(g => ({
            goalId:     g.id,
            goalName:   g.name,
            categories: g.detail?.saving_history || [],
        }));
    },
};

// ── Real 구현 ─────────────────────────────────────────
const realSpending = {
    getToday:     ()                   => http.get('/api/spending/today'),
    create:       dto                  => http.post('/api/spending', dto),
    delete:       id                   => http.delete(`/api/spending/${id}`),
    getAnalytics: cycleDate            => http.get(`/api/spending/analytics?cycleDate=${cycleDate}`),
    save:         (spendingId, goalId) => http.post(`/api/spending/${spendingId}/save`, { goalId }),
};

export const spendingApi = USE_BACKEND ? realSpending : mockSpending;
