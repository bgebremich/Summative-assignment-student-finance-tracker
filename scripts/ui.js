import { highlight, escapeHtml, formatDate, formatAmount } from './search.js';

export function renderTable(records, re, crossId = null) {
    const body = document.getElementById('records-body');

    if (records.length === 0) {
        body.innerHTML = '<tr><td colspan="5">No records to show.</td></tr>';
        return;
    }

    body.innerHTML = records.map(r => {
        const flagged = r.id === crossId;
        return `
        <tr data-id="${escapeHtml(r.id)}" class="${flagged ? 'cap-row' : ''}">
            <td>${highlight(formatDate(r.date), re)}</td>
            <td>${highlight(r.description, re)}</td>
            <td><span class="chip">${highlight(r.category, re)}</span></td>
            <td class="num">${highlight(formatAmount(r.amount), re)}${flagged ? '<span class="badge">Cap reached</span>' : ''}</td>
            <td class="actions">
                <button type="button" class="edit-btn small outline" data-id="${escapeHtml(r.id)}"
                    aria-label="Edit ${escapeHtml(r.description)}">Edit</button>
                <button type="button" class="delete-btn small danger-outline" data-id="${escapeHtml(r.id)}"
                    aria-label="Delete ${escapeHtml(r.description)}">Delete</button>
            </td>
        </tr>`;
    }).join('');
}

export function renderStats(stats, last7) {
    document.getElementById('stat-count').textContent = stats.count;
    document.getElementById('stat-sum').textContent = formatAmount(stats.sum);
    document.getElementById('stat-top').textContent = stats.top;

    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const max = Math.max(...last7.map(d => d.total));
    const trend = document.getElementById('trend');

    trend.innerHTML = last7.map(d => {
        let height = 0;
        if (max > 0 && d.total > 0) height = Math.max(Math.round((d.total / max) * 100), 4);
        const label = names[new Date(d.date + 'T00:00:00').getDay()];
        return '<div class="bar-col">' +
            '<div class="bar-area"><div class="bar" style="height:' + height + 'px" title="' +
            formatDate(d.date) + ': ' + formatAmount(d.total) + '"></div></div>' +
            '<span class="bar-label">' + label + '</span></div>';
    }).join('');

    trend.setAttribute('aria-label', 'Spending over the last 7 days: ' +
        last7.map(d => formatDate(d.date) + ' ' + formatAmount(d.total)).join(', '));
}

export function renderCap(total, cap, code) {
    const msg = document.getElementById('cap-message');
    const fill = document.getElementById('budget-fill');
    const bar = document.getElementById('budget-bar');
    const numbers = document.getElementById('budget-numbers');

    msg.classList.remove('over', 'under');
    fill.className = 'progress-fill';

    if (!cap || cap <= 0) {
        fill.style.width = '0%';
        bar.setAttribute('aria-valuenow', '0');
        numbers.textContent = 'No cap set';
        msg.setAttribute('aria-live', 'polite');
        msg.textContent = 'No spending cap set. You can set one in Settings.';
        return;
    }

    const percent = Math.min((total / cap) * 100, 100);
    fill.style.width = percent + '%';
    bar.setAttribute('aria-valuenow', String(Math.round(percent)));
    numbers.textContent = formatAmount(total) + ' of ' + formatAmount(cap) + ' ' + code;

    const diff = cap - total;
    if (diff >= 0) {
        fill.classList.add(percent >= 80 ? 'warn' : 'ok');
        msg.setAttribute('aria-live', 'polite');
        msg.classList.add('under');
        msg.textContent = formatAmount(diff) + ' ' + code + ' left under your cap.';
    } else {
        fill.classList.add('over');
        msg.setAttribute('aria-live', 'assertive');
        msg.classList.add('over');
        msg.textContent = 'Over your cap by ' + formatAmount(Math.abs(diff)) + ' ' + code + '.';
    }
}

export function renderConverted(total, settings) {
    const el = document.getElementById('stat-converted');
    const rates = { USD: 1, ...settings.rates };
    const base = settings.baseCurrency;
    const inUsd = total / rates[base];

    const others = Object.keys(rates)
        .filter(code => code !== base)
        .map(code => formatAmount(inUsd * rates[code]) + ' ' + code);

    el.textContent = 'Total in ' + base + ': ' + formatAmount(total) +
        '. About ' + others.join(' or ') + '.';
}