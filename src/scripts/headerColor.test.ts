// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initHeaderColor } from './headerColor';

describe('initHeaderColor', () => {
	let cleanup: (() => void) | undefined;

	beforeEach(() => {
		document.body.innerHTML = '<header class="site-header"></header>';
		Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
	});

	afterEach(() => {
		cleanup?.();
		cleanup = undefined;
		vi.restoreAllMocks();
	});

	it('does nothing when the header is absent', () => {
		document.body.innerHTML = '';
		expect(initHeaderColor()).toBeUndefined();
	});

	it('switches between light and dark styles based on scroll position', () => {
		cleanup = initHeaderColor();
		const header = document.querySelector<HTMLElement>('.site-header');

		expect(header?.classList.contains('light')).toBe(true);
		expect(header?.classList.contains('dark')).toBe(false);

		Object.defineProperty(window, 'scrollY', { configurable: true, value: 20 });
		window.dispatchEvent(new Event('scroll'));

		expect(header?.classList.contains('light')).toBe(false);
		expect(header?.classList.contains('dark')).toBe(true);
	});

	it('initializes only once until cleaned up', () => {
		const addEventListener = vi.spyOn(window, 'addEventListener');
		cleanup = initHeaderColor();

		expect(initHeaderColor()).toBeUndefined();
		expect(
			addEventListener.mock.calls.filter(([eventName]) => eventName === 'scroll')
		).toHaveLength(1);

		cleanup?.();
		cleanup = initHeaderColor();

		expect(
			addEventListener.mock.calls.filter(([eventName]) => eventName === 'scroll')
		).toHaveLength(2);
	});
});
