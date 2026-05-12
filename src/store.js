import { STORAGE_KEY, SETTINGS_KEY, DEFAULT_SETTINGS } from './config.js';

let _data = null;
let _settings = null;

export function loadData(fallback) {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (!Array.isArray(parsed.goals)) parsed.goals = fallback.goals;
            if (!Array.isArray(parsed.expected_spending)) parsed.expected_spending = fallback.expected_spending;
            _data = parsed;
            return _data;
        }
    } catch (_) {}
    _data = { ...fallback };
    persistData();
    return _data;
}

export function getData() { return _data; }

export function setData(updates) {
    _data = { ..._data, ...updates };
    persistData();
    return _data;
}

export function persistData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_data));
}

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

export function resetAll(fallback) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
    _data = null;
    _settings = null;
    return loadData(fallback);
}
