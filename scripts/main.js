import { loadRecords, saveRecords, loadSettings, saveSettings } from './storage.js';
import {
    state, setRecords, getVisibleRecords,
    addRecord, updateRecord, deleteRecord, getStats, getLast7Days
} from './state.js';
import { compileRegex } from './search.js';
import { renderTable, renderStats, renderCap, renderConverted } from './ui.js';
import {
    validateDescription, validateAmount, validateCategory, validateDate,
    validateRecord, validateImport
} from './validators.js';


const searchInput = document.getElementById('search-input');
const caseToggle = document.getElementById('case-toggle');
const sortSelect = document.getElementById('sort-select');
const searchStatus = document.getElementById('search-status');


const form = document.getElementById('record-form');
const recordIdInput = document.getElementById('record-id');
const saveBtn = document.getElementById('save-btn');
const cancelBtn = document.getElementById('cancel-btn');
const formStatus = document.getElementById('form-status');

const fields = {
    description: document.getElementById('description'),
    amount: document.getElementById('amount'),
    category: document.getElementById('category'),
    date: document.getElementById('date')
};
const errorEls = {
    description: document.getElementById('description-error'),
    amount: document.getElementById('amount-error'),
    category: document.getElementById('category-error'),
    date: document.getElementById('date-error')
};
const checkers = {
    description: validateDescription,
    amount: validateAmount,
    category: validateCategory,
    date: validateDate
};

const capInput = document.getElementById('cap-input');
const capError = document.getElementById('cap-error');
const exportBtn = document.getElementById('export-btn');
const importFile = document.getElementById('import-file');
const dataStatus = document.getElementById('data-status');
const baseSelect = document.getElementById('base-currency');
const rateEur = document.getElementById('rate-eur');
const rateRwf = document.getElementById('rate-rwf');
const currencyStatus = document.getElementById('currency-status');

function render() {
    const query = searchInput.value;
    const re = compileRegex(query, caseToggle.checked);
    const badPattern = query !== '' && re === null;

    searchInput.setAttribute('aria-invalid', badPattern ? 'true' : 'false');

    const rows = getVisibleRecords(badPattern ? null : re);
    renderTable(rows, badPattern ? null : re);

    if (badPattern) {
        searchStatus.textContent = 'That pattern is not valid yet. Showing all records.';
    } else if (query) {
        searchStatus.textContent = rows.length + ' record(s) match.';
    } else {
        searchStatus.textContent = '';
    }

    const stats = getStats();
    renderStats(stats, getLast7Days());
    renderCap(stats.sum, state.settings ? state.settings.cap : 0);
    renderConverted(stats.sum, state.settings);
}

function persistAndRender() {
    saveRecords(state.records);
    render();
}

function showFieldError(name, message) {
    errorEls[name].textContent = message;
    fields[name].classList.toggle('invalid', message !== '');
    fields[name].setAttribute('aria-invalid', message !== '' ? 'true' : 'false');
}

function resetForm() {
    form.reset();
    recordIdInput.value = '';
    state.editingId = null;
    for (const name of Object.keys(fields)) showFieldError(name, '');
    saveBtn.textContent = 'Save record';
}

function startEdit(id) {
    const rec = state.records.find(r => r.id === id);
    if (!rec) return;

    state.editingId = id;
    recordIdInput.value = id;
    fields.description.value = rec.description;
    fields.amount.value = String(rec.amount);
    fields.category.value = rec.category;
    fields.date.value = rec.date;
    for (const name of Object.keys(fields)) showFieldError(name, '');

    saveBtn.textContent = 'Update record';
    formStatus.textContent = 'Editing "' + rec.description + '". Change the fields, then press Update record.';
    document.getElementById('form').scrollIntoView();
    fields.description.focus();
}

function removeRecord(id) {
    const rec = state.records.find(r => r.id === id);
    if (!rec) return;
    if (!confirm('Delete "' + rec.description + '"? This cannot be undone.')) return;

    deleteRecord(id);
    if (state.editingId === id) resetForm();
    persistAndRender();
    formStatus.textContent = 'Record deleted.';

    const heading = document.getElementById('records-title');
    heading.setAttribute('tabindex', '-1');
    heading.focus();
}

searchInput.addEventListener('input', render);
caseToggle.addEventListener('change', render);
sortSelect.addEventListener('change', () => {
    state.sortKey = sortSelect.value;
    render();
});

for (const name of Object.keys(fields)) {
    fields[name].setAttribute('aria-describedby', name + '-error');
    fields[name].addEventListener('input', () => {
        showFieldError(name, checkers[name](fields[name].value));
    });
}

form.addEventListener('submit', e => {
    e.preventDefault();

    const data = {
        description: fields.description.value,
        amount: fields.amount.value,
        category: fields.category.value,
        date: fields.date.value
    };
    const { valid, errors } = validateRecord(data);

    for (const name of Object.keys(errors)) showFieldError(name, errors[name]);

    if (!valid) {
        formStatus.textContent = 'Please fix the highlighted fields.';
        const firstBad = Object.keys(errors).find(n => errors[n] !== '');
        fields[firstBad].focus();
        return;
    }

    const id = recordIdInput.value;
    let message;
    if (id) {
        updateRecord(id, data);
        message = 'Record updated.';
    } else {
        addRecord(data);
        message = 'Record added.';
    }

    persistAndRender();
    resetForm();
    formStatus.textContent = message;
});

cancelBtn.addEventListener('click', () => {
    resetForm();
    formStatus.textContent = 'Cancelled.';
});

document.getElementById('records-body').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.classList.contains('edit-btn')) startEdit(id);
    if (btn.classList.contains('delete-btn')) removeRecord(id);
});

capInput.addEventListener('input', () => {
    const value = capInput.value.trim();
    const msg = value === '' ? '' : validateAmount(value);

    capError.textContent = msg;
    capInput.classList.toggle('invalid', msg !== '');
    capInput.setAttribute('aria-invalid', msg !== '' ? 'true' : 'false');
    if (msg || !state.settings) return;

    state.settings.cap = value === '' ? 0 : Number(value);
    saveSettings(state.settings);
    render();
});

exportBtn.addEventListener('click', () => {
    const json = JSON.stringify(state.records, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'finance-tracker-export.json';
    link.click();
    URL.revokeObjectURL(url);
    dataStatus.textContent = 'Exported ' + state.records.length + ' record(s).';
});

importFile.addEventListener('change', async () => {
    const file = importFile.files[0];
    if (!file) return;

    try {
        const data = JSON.parse(await file.text());
        const result = validateImport(data);

        if (!result.valid) {
            dataStatus.textContent = 'Import failed: ' + result.error;
            return;
        }
        if (!confirm('Replace your ' + state.records.length + ' record(s) with the ' +
            data.length + ' in this file?')) {
            dataStatus.textContent = 'Import cancelled.';
            return;
        }

        setRecords(data);
        resetForm();
        persistAndRender();
        dataStatus.textContent = 'Imported ' + data.length + ' record(s).';
    } catch (err) {
        dataStatus.textContent = 'Import failed: that file is not valid JSON.';
    } finally {
        importFile.value = '';
    }
});

function checkRate(input) {
    const value = input.value.trim();
    if (value === '') return 'Enter a rate.';
    const msg = validateAmount(value);
    if (msg) return msg;
    if (Number(value) === 0) return 'A rate must be more than 0.';
    return '';
}

baseSelect.addEventListener('change', () => {
    state.settings.baseCurrency = baseSelect.value;
    saveSettings(state.settings);
    render();
});

for (const [code, input] of [['EUR', rateEur], ['RWF', rateRwf]]) {
    input.addEventListener('input', () => {
        const msg = checkRate(input);
        currencyStatus.textContent = msg;
        input.classList.toggle('invalid', msg !== '');
        input.setAttribute('aria-invalid', msg !== '' ? 'true' : 'false');
        if (msg) return;

        state.settings.rates[code] = Number(input.value);
        saveSettings(state.settings);
        render();
    });
}


async function init() {
    const stored = loadRecords();
    if (stored === null) {
        try {
            const res = await fetch('seed.json');
            setRecords(await res.json());
        } catch (err) {
            console.error('Could not load seed data:', err);
            setRecords([]);
        }
        saveRecords(state.records);
    } else {
        setRecords(stored);
    }

    state.settings = loadSettings();
    capInput.value = state.settings.cap ? String(state.settings.cap) : '';
    baseSelect.value = state.settings.baseCurrency;
    rateEur.value = String(state.settings.rates.EUR);
    rateRwf.value = String(state.settings.rates.RWF);
    render();
}

init();