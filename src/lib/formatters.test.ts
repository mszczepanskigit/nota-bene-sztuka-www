import { describe, expect, it } from 'vitest';
import { isValidEmail, slugify, truncate } from './formatters';

// ---------------------------------------------------------------------------
// isValidEmail
// ---------------------------------------------------------------------------
describe('isValidEmail', () => {
	it('accepts a standard address', () => {
		expect(isValidEmail('kontakt@notabenesztuka.pl')).toBe(true);
	});

	it('accepts an address with a subdomain', () => {
		expect(isValidEmail('user@mail.example.com')).toBe(true);
	});

	it('rejects an address without @', () => {
		expect(isValidEmail('notanemail')).toBe(false);
	});

	it('rejects an address without a dot in the domain part', () => {
		expect(isValidEmail('user@nodot')).toBe(false);
	});

	it('rejects an empty string', () => {
		expect(isValidEmail('')).toBe(false);
	});

	it('ignores surrounding whitespace when validating', () => {
		expect(isValidEmail('  kontakt@notabenesztuka.pl  ')).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// truncate
// ---------------------------------------------------------------------------
describe('truncate', () => {
	it('returns the original text when it fits within the limit', () => {
		expect(truncate('Historia', 10)).toBe('Historia');
	});

	it('returns the original text when its length equals the limit', () => {
		expect(truncate('Hello', 5)).toBe('Hello');
	});

	it('truncates and appends an ellipsis when the text exceeds the limit', () => {
		const result = truncate('Historia sztuki jest piękna', 10);
		expect(result.endsWith('…')).toBe(true);
		// visible characters before ellipsis must be ≤ maxLength
		expect(result.replace(/…$/, '').length).toBeLessThanOrEqual(10);
	});

	it('handles an empty string', () => {
		expect(truncate('', 5)).toBe('');
	});
});

// ---------------------------------------------------------------------------
// slugify
// ---------------------------------------------------------------------------
describe('slugify', () => {
	it('lowercases ASCII text and replaces spaces with hyphens', () => {
		expect(slugify('Historia Sztuki')).toBe('historia-sztuki');
	});

	it('removes Polish diacritics', () => {
		expect(slugify('Żółta łódź')).toBe('zolta-lodz');
	});

	it('collapses multiple spaces into a single hyphen', () => {
		expect(slugify('hello   world')).toBe('hello-world');
	});

	it('trims leading and trailing hyphens', () => {
		expect(slugify('  trim me  ')).toBe('trim-me');
	});

	it('handles an empty string', () => {
		expect(slugify('')).toBe('');
	});
});
