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