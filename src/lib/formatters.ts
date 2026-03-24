/**
 * Truncates `text` to at most `maxLength` characters and appends `…` when shortened.
 *
 * @example truncate("Historia sztuki jest piękna", 10) → "Historia s…"
 */
export function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Characters that do NOT decompose via Unicode NFD (no combining-diacritic
 * equivalent) and therefore need an explicit transliteration step.
 */
const LATIN_NON_DECOMPOSABLE: Record<string, string> = {
	ł: 'l',
	Ł: 'L',
};

/**
 * Converts a string (including Polish diacritics) to a URL-friendly slug.
 *
 * @example slugify("Historia Sztuki")  → "historia-sztuki"
 * @example slugify("Żółta łódź")       → "zolta-lodz"
 */
export function slugify(text: string): string {
	return text
		.replace(/[łŁ]/g, (c) => LATIN_NON_DECOMPOSABLE[c] ?? c) // explicit pre-pass for non-NFD chars
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // strip combining diacritics
		.replace(/[^\w\s-]/g, '') // remove remaining non-word chars
		.trim()
		.replace(/[\s_-]+/g, '-') // collapse whitespace/underscore/hyphens
		.replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}

/**
 * Returns `true` when `email` looks like a valid e-mail address.
 * Covers the common case (local-part @ domain.tld); intentionally kept
 * simple — full RFC 5322 parsing belongs to a dedicated library.
 *
 * Used for lightweight client-side pre-validation before form submission.
 *
 * @example isValidEmail("kontakt@notabenesztuka.pl") → true
 * @example isValidEmail("not-an-email")              → false
 */
export function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
