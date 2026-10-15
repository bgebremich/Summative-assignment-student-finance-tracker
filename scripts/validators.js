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