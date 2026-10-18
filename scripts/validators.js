export const patterns = {
    description: /^\S(?:.*\S)?$/,
    amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    duplicateWord: /\b(\w+)\s+\1\b/i
};

export function validateDescription(value) {
    if (!patterns.description.test(value)) {
        return 'Description cannot be empty or start/end with a space.';
    }
    if (/\s{2,}/.test(value)) {
        return 'Use single spaces between words.';
    }
    if (patterns.duplicateWord.test(value)) {
        return 'A word is repeated twice in a row. Check for a typo.';
    }
    return '';
}

export function validateAmount(value) {
    if (!patterns.amount.test(value)) {
        return 'Enter a number like 12 or 12.50 (max 2 decimals, no leading zeros).';
    }
    return '';
}

export function validateDate(value) {
    if (!patterns.date.test(value)) {
        return 'Use the format YYYY-MM-DD, for example 2025-09-29.';
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
        return 'That date does not exist on the calendar.';
    }
    return '';
}

export function validateCategory(value) {
    if (!patterns.category.test(value)) {
        return 'Use letters, spaces or hyphens only (for example Fast-food).';
    }
    return '';
}

export function validateRecord(data) {
    const errors = {
        description: validateDescription(data.description),
        amount: validateAmount(data.amount),
        category: validateCategory(data.category),
        date: validateDate(data.date)
    };
    const valid = Object.values(errors).every(msg => msg === '');
    return { valid, errors };
}
export function validateImport(data) {
    if (!Array.isArray(data)) {
        return { valid: false, error: 'The file must contain a list of records.' };
    }
    const seen = new Set();
    for (let i = 0; i < data.length; i++) {
        const r = data[i];
        const row = 'Record ' + (i + 1) + ': ';

        if (typeof r !== 'object' || r === null) {
            return { valid: false, error: row + 'is not an object.' };
        }
        if (typeof r.id !== 'string' || r.id === '') {
            return { valid: false, error: row + 'missing id.' };
        }
        if (seen.has(r.id)) {
            return { valid: false, error: row + 'duplicate id ' + r.id + '.' };
        }
        seen.add(r.id);
        if (typeof r.description !== 'string' || r.description.trim() === '') {
            return { valid: false, error: row + 'missing description.' };
        }
        if (typeof r.amount !== 'number' || !Number.isFinite(r.amount) || r.amount < 0) {
            return { valid: false, error: row + 'amount must be a number of 0 or more.' };
        }
        if (typeof r.category !== 'string' || validateCategory(r.category) !== '') {
            return { valid: false, error: row + 'invalid category.' };
        }
        if (typeof r.date !== 'string' || validateDate(r.date) !== '') {
            return { valid: false, error: row + 'invalid date.' };
        }
        if (typeof r.createdAt !== 'string' || typeof r.updatedAt !== 'string') {
            return { valid: false, error: row + 'missing timestamps.' };
        }
    }
    return { valid: true, error: '' };
}