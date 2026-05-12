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
const mockGoals = {
    getAll: async () => {
        await _delay();
        return _readStore().goals;
    },

    getOne: async id => {
        await _delay();
        return _readStore().goals.find(g => g.id === id) ?? null;
    },

    create: async dto => {
        await _delay();
        const store = _readStore();
        const goal = {
            id:             _nextId(store.goals),
            current_amount: 0,
            endDate:        dto.endDate || '',
            detail: {
                screen_title:          `${dto.name} 상세`,
                history_section_title: '카테고리별 절약 내역',
                billing_period:        {
                    start: new Date().toLocaleDateString('ko-KR').replace(/ /g, ''),
                    end: '', total_save_count: 0,
                },
                saving_history: [],
            },
            ...dto,
        };
        store.goals.push(goal);
        _writeStore(store);
        return goal;
    },

    update: async (id, dto) => {
        await _delay();
        const store = _readStore();
        const idx = store.goals.findIndex(g => g.id === id);
        if (idx === -1) throw new Error('Goal not found');
        store.goals[idx] = { ...store.goals[idx], ...dto };
        _writeStore(store);
        return store.goals[idx];
    },

    delete: async id => {
        await _delay();
        const store = _readStore();
        store.goals = store.goals.filter(g => g.id !== id);
        _writeStore(store);
    },

    addSaving: async (id, { amount, category, icon }) => {
        await _delay();
        const store = _readStore();
        const goal  = store.goals.find(g => g.id === id);
        if (!goal) throw new Error('Goal not found');

        goal.current_amount = (goal.current_amount || 0) + amount;

        const history  = goal.detail.saving_history;
        const existing = history.find(h => h.category === category);
        if (existing) {
            existing.save_count  += 1;
            existing.total_saved += amount;
        } else {
            history.push({ id: _nextId(history), category, icon: icon || 'etc', save_count: 1, total_saved: amount });
        }
        _writeStore(store);
        return goal;
    },
};

// ── Real 구현 ─────────────────────────────────────────
const realGoals = {
    getAll:    ()          => http.get('/api/goals'),
    getOne:    id          => http.get(`/api/goals/${id}`),
    create:    dto         => http.post('/api/goals', dto),
    update:    (id, dto)   => http.patch(`/api/goals/${id}`, dto),
    delete:    id          => http.delete(`/api/goals/${id}`),
    addSaving: (id, dto)   => http.post(`/api/goals/${id}/save`, dto),
};

export const goalsApi = USE_BACKEND ? realGoals : mockGoals;
