const RECORDS_KEY = 'sft:records';
const SETTINGS_KEY = 'sft:settings';

const defaultSettings = {
    baseCurrency: 'USD',
    rates: { EUR: 0.92, RWF: 1450 },
    cap: 0
};

export function loadRecords() {
    try {
        const raw = localStorage.getItem(RECORDS_KEY);
        if (raw === null) return null;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
        console.error('Could not read saved records:', err);
        return [];
    }
}

export function saveRecords(records) {
    try {
        localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    } catch (err) {
        console.error('Could not save records:', err);
    }
}

export function loadSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        return raw ? { ...defaultSettings, ...JSON.parse(raw) } : { ...defaultSettings };
    } catch (err) {
        return { ...defaultSettings };
    }
}

export function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (err) {
        console.error('Could not save settings:', err);
    }
}