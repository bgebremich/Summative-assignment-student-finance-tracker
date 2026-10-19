import { highlight, escapeHtml } from './search.js';

export function renderTable(records, re, overIds = new Set()) {
    const body = document.getElementById('records-body');

    if (records.length === 0) {
        body.innerHTML = '<tr><td colspan="5">No records to show.</td></tr>';
        return;
    }

    body.innerHTML = records.map(r => `
        <tr data-id="${escapeHtml(r.id)}" class="${overIds.has(r.id) ? 'over-cap' : ''}">
            <td>${highlight(r.date, re)}</td>
            <td>${highlight(r.description, re)}</td>
            <td>${highlight(r.category, re)}</td>
            <td>${highlight(r.amount.toFixed(2), re)}${overIds.has(r.id) ? ' <span class="badge">Over cap</span>' : ''}</td>
            <td>
                <button type="button" class="edit-btn" data-id="${escapeHtml(r.id)}"
                    aria-label="Edit ${escapeHtml(r.description)}">Edit</button>
                <button type="button" class="delete-btn danger" data-id="${escapeHtml(r.id)}"
                    aria-label="Delete ${escapeHtml(r.description)}">Delete</button>
            </td>
        </tr>
    `).join('');
}

export function renderStats(stats, last7) {
    document.getElementById('stat-count').textContent = stats.count;
    document.getElementById('stat-sum').textContent = stats.sum.toFixed(2);
    document.getElementById('stat-top').textContent = stats.top;

    const trend = document.getElementById('trend');
    const max = Math.max(...last7.map(d => d.total));
    trend.innerHTML = last7.map(d => {
        let pct = 0;
        if (max > 0 && d.total > 0) pct = Math.max((d.total / max) * 100, 4);
        return '<div class="bar" style="height:' + pct + '%" title="' +
            d.date + ': ' + d.total.toFixed(2) + '"></div>';
    }).join('');
    trend.setAttribute('aria-label', 'Spending over the last 7 days: ' +
        last7.map(d => d.date + ' ' + d.total.toFixed(2)).join(', '));
}

export function renderCap(total, cap) {
    const el = document.getElementById('cap-message');
    el.classList.remove('over', 'under');

    if (!cap || cap <= 0) {
        el.setAttribute('aria-live', 'polite');
        el.textContent = 'No spending cap set. You can set one in Settings.';
        return;
    }

    const diff = cap - total;
    if (diff >= 0) {
        el.setAttribute('aria-live', 'polite');
        el.classList.add('under');
        el.textContent = diff.toFixed(2) + ' left under your cap of ' + cap.toFixed(2) + '.';
    } else {
        el.setAttribute('aria-live', 'assertive');
        el.classList.add('over');
        el.textContent = 'Over your cap by ' + Math.abs(diff).toFixed(2) + ' (cap is ' + cap.toFixed(2) + ').';
    }
}

export function renderConverted(total, settings) {
    const el = document.getElementById('stat-converted');
    const rates = { USD: 1, ...settings.rates };
    const base = settings.baseCurrency;
    const inUsd = total / rates[base];

    const others = Object.keys(rates)
        .filter(code => code !== base)
        .map(code => (inUsd * rates[code]).toFixed(2) + ' ' + code);

    el.textContent = 'Total in ' + base + ': ' + total.toFixed(2) +
        '. About ' + others.join(' or ') + '.';
}