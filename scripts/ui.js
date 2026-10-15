import { highlight, escapeHtml } from './search.js';

export function renderTable(records, re) {
    const body = document.getElementById('records-body');

    if (records.length === 0) {
        body.innerHTML = '<tr><td colspan="5">No records to show.</td></tr>';
        return;
    }

    body.innerHTML = records.map(r => `
        <tr data-id="${escapeHtml(r.id)}">
            <td>${highlight(r.date, re)}</td>
            <td>${highlight(r.description, re)}</td>
            <td>${highlight(r.category, re)}</td>
            <td>${highlight(r.amount.toFixed(2), re)}</td>
            <td>
                <button type="button" class="edit-btn" data-id="${escapeHtml(r.id)}"
                    aria-label="Edit ${escapeHtml(r.description)}">Edit</button>
                <button type="button" class="delete-btn danger" data-id="${escapeHtml(r.id)}"
                    aria-label="Delete ${escapeHtml(r.description)}">Delete</button>
            </td>
        </tr>
    `).join('');
}