import { loadRecords, saveRecords, loadSettings } from './storage.js';
import { state, setRecords, getVisibleRecords } from './state.js';
import { compileRegex } from './search.js';
import { renderTable } from './ui.js';

const searchInput = document.getElementById('search-input');
const caseToggle = document.getElementById('case-toggle');
const sortSelect = document.getElementById('sort-select');
const searchStatus = document.getElementById('search-status');

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
    render();
}

searchInput.addEventListener('input', render);
caseToggle.addEventListener('change', render);
sortSelect.addEventListener('change', () => {
    state.sortKey = sortSelect.value;
    render();
});

init();