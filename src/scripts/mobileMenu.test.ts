// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { initMobileMenu } from './mobileMenu';

function initializeMenu(): () => void {
	const cleanup = initMobileMenu();
	document.dispatchEvent(new Event('DOMContentLoaded'));
	return cleanup;
}

describe('initMobileMenu', () => {
	const cleanups: Array<() => void> = [];

	beforeEach(() => {
		document.body.innerHTML = `
			<button
				type="button"
				class="menu-toggle"
				aria-label="Otwórz menu"
				aria-expanded="false"
				aria-controls="mobile-navigation"
			>
				Menu
			</button>
			<div class="mobile-menu-backdrop" aria-hidden="true"></div>
			<nav id="mobile-navigation" class="nav-mobile" aria-hidden="true" inert>
				<a href="#oferta">Oferta</a>
				<a href="#kontakt">Kontakt</a>
			</nav>
		`;
		document.body.style.overflow = 'auto';
	});

	afterEach(() => {
		cleanups
			.splice(0)
			.reverse()
			.forEach((cleanup) => cleanup());
		document.body.style.overflow = '';
	});

	it('does nothing when required elements are absent', () => {
		document.body.innerHTML = '';
		expect(() => cleanups.push(initializeMenu())).not.toThrow();
	});

	it('opens the menu, updates accessibility state, and focuses the first link', () => {
		cleanups.push(initializeMenu());
		const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
		const nav = document.querySelector<HTMLElement>('.nav-mobile');
		const backdrop = document.querySelector<HTMLElement>('.mobile-menu-backdrop');
		const firstLink = document.querySelector<HTMLAnchorElement>('.nav-mobile a');

		toggle?.click();

		expect(toggle?.getAttribute('aria-expanded')).toBe('true');
		expect(toggle?.getAttribute('aria-label')).toBe('Zamknij menu');
		expect(nav?.getAttribute('aria-hidden')).toBe('false');
		expect(nav?.inert).toBe(false);
		expect(backdrop?.getAttribute('aria-hidden')).toBe('false');
		expect(document.body.style.overflow).toBe('hidden');
		expect(document.activeElement).toBe(firstLink);
	});

	it('closes on Escape, restores page state, and returns focus to the toggle', () => {
		cleanups.push(initializeMenu());
		const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
		const nav = document.querySelector<HTMLElement>('.nav-mobile');

		toggle?.click();
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

		expect(toggle?.getAttribute('aria-expanded')).toBe('false');
		expect(toggle?.getAttribute('aria-label')).toBe('Otwórz menu');
		expect(nav?.getAttribute('aria-hidden')).toBe('true');
		expect(nav?.inert).toBe(true);
		expect(document.body.style.overflow).toBe('auto');
		expect(document.activeElement).toBe(toggle);
	});

	it('traps forward and backward focus inside the open controls', () => {
		cleanups.push(initializeMenu());
		const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
		const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav-mobile a'));
		const lastLink = links.at(-1);

		toggle?.click();
		lastLink?.focus();
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
		expect(document.activeElement).toBe(toggle);

		toggle?.focus();
		document.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true })
		);
		expect(document.activeElement).toBe(lastLink);
	});

	it('closes after link selection and returns focus to the toggle', () => {
		cleanups.push(initializeMenu());
		const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
		const firstLink = document.querySelector<HTMLAnchorElement>('.nav-mobile a');

		toggle?.click();
		firstLink?.click();

		expect(toggle?.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(toggle);
	});

	it('closes after backdrop interaction and returns focus to the toggle', () => {
		cleanups.push(initializeMenu());
		const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
		const backdrop = document.querySelector<HTMLElement>('.mobile-menu-backdrop');

		toggle?.click();
		backdrop?.click();

		expect(toggle?.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(toggle);
	});

	it('does not register duplicate toggle behavior', () => {
		cleanups.push(initializeMenu(), initializeMenu());
		const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');

		toggle?.click();

		expect(toggle?.getAttribute('aria-expanded')).toBe('true');
	});
});
