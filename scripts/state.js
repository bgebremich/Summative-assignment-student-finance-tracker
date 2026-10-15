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