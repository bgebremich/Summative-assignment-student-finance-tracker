export const state = {
    records: [],
    settings: null,
    sortKey: 'date-desc',
    editingId: null
};

export function setRecords(list) {
    state.records = list;
}

export function nextId() {
    const numbers = state.records.map(r => parseInt(r.id.replace('rec_', ''), 10) || 0);
    const next = (numbers.length ? Math.max(...numbers) : 0) + 1;
    return 'rec_' + String(next).padStart(4, '0');
}

const sorters = {
    'date-desc': (a, b) => b.date.localeCompare(a.date),
    'date-asc': (a, b) => a.date.localeCompare(b.date),
    'desc-asc': (a, b) => a.description.localeCompare(b.description),
    'desc-desc': (a, b) => b.description.localeCompare(a.description),
    'amount-asc': (a, b) => a.amount - b.amount,
    'amount-desc': (a, b) => b.amount - a.amount
};

export function getVisibleRecords(re) {
    const matches = re
        ? state.records.filter(r =>
            re.test(r.description) ||
            re.test(r.category) ||
            re.test(r.amount.toFixed(2)) ||
            re.test(r.date))
        : [...state.records];
    return matches.sort(sorters[state.sortKey] || sorters['date-desc']);
}
export function addRecord(data) {
    const now = new Date().toISOString();
    const rec = {
        id: nextId(),
        description: data.description,
        amount: Number(data.amount),
        category: data.category,
        date: data.date,
        createdAt: now,
        updatedAt: now
    };
    state.records.push(rec);
    return rec;
}

export function updateRecord(id, data) {
    const rec = state.records.find(r => r.id === id);
    if (!rec) return null;
    rec.description = data.description;
    rec.amount = Number(data.amount);
    rec.category = data.category;
    rec.date = data.date;
    rec.updatedAt = new Date().toISOString();
    return rec;
}

export function deleteRecord(id) {
    state.records = state.records.filter(r => r.id !== id);
}

export function getStats() {
    const count = state.records.length;
    let sum = 0;
    const byCategory = {};
    for (const r of state.records) {
        sum += r.amount;
        byCategory[r.category] = (byCategory[r.category] || 0) + r.amount;
    }
    let top = 'None';
    let best = -1;
    for (const [cat, total] of Object.entries(byCategory)) {
        if (total > best) { best = total; top = cat; }
    }
    return { count, sum, top };
}

function localKey(d) {
    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
}

export function getLast7Days() {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        days.push({ date: localKey(d), total: 0 });
    }
    for (const r of state.records) {
        const day = days.find(x => x.date === r.date);
        if (day) day.total += r.amount;
    }
    return days;
}