const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function compileRegex(input, ignoreCase = true) {
    try {
        return input ? new RegExp(input, ignoreCase ? 'i' : '') : null;
    } catch {
        return null;
    }
}

export function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function highlight(text, re) {
    const str = String(text);
    if (!re) return escapeHtml(str);

    const flags = re.flags.includes('g') ? re.flags : re.flags + 'g';
    const globalRe = new RegExp(re.source, flags);

    let result = '';
    let last = 0;
    for (const match of str.matchAll(globalRe)) {
        if (match[0] === '') continue;
        result += escapeHtml(str.slice(last, match.index));
        result += '<mark>' + escapeHtml(match[0]) + '</mark>';
        last = match.index + match[0].length;
    }
    return result + escapeHtml(str.slice(last));
}

// 2026-10-29 -> 29 Oct 2026 (year last, for display only)
export function formatDate(iso) {
    const [year, month, day] = String(iso).split('-');
    const name = MONTHS[Number(month) - 1];
    if (!year || !day || !name) return String(iso);
    return Number(day) + ' ' + name + ' ' + year;
}

// 2500000 -> 2,500,000.00
export function formatAmount(value) {
    return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}