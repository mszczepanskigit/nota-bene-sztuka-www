// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initTestimonialCarousel } from './testimonialCarousel';

function initializeCarousel(): () => void {
	const cleanup = initTestimonialCarousel();
	document.dispatchEvent(new Event('DOMContentLoaded'));
	return cleanup;
}

describe('initTestimonialCarousel', () => {
	const cleanups: Array<() => void> = [];

	beforeEach(() => {
		vi.useFakeTimers();
		document.body.innerHTML = `
			<div class="opinie-carousel-wrapper">
				<button type="button" class="opinie-nav-left">Previous</button>
				<div class="opinie-carousel">
					<div class="opinie-cards-track" style="gap: 16px">
						<article class="opinie-card">One</article>
						<article class="opinie-card">Two</article>
						<article class="opinie-card">Three</article>
					</div>
				</div>
				<button type="button" class="opinie-nav-right">Next</button>
				<button type="button" class="opinie-dot" data-index="0"></button>
				<button type="button" class="opinie-dot" data-index="1"></button>
				<button type="button" class="opinie-dot" data-index="2"></button>
			</div>
		`;
		Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 });
		vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (
			this: HTMLElement
		) {
			if (this.classList.contains('opinie-carousel')) return 600;
			if (this.classList.contains('opinie-card')) return 200;
			return 0;
		});
	});

	afterEach(() => {
		cleanups
			.splice(0)
			.reverse()
			.forEach((cleanup) => cleanup());
		vi.clearAllTimers();
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it('does nothing when required elements are absent', () => {
		document.body.innerHTML = '';
		expect(() => cleanups.push(initializeCarousel())).not.toThrow();
	});

	it('clones cards only once and removes clones during cleanup', () => {
		const firstCleanup = initializeCarousel();
		cleanups.push(firstCleanup, initializeCarousel());
		const track = document.querySelector<HTMLElement>('.opinie-cards-track');

		expect(track?.querySelectorAll('.opinie-card')).toHaveLength(9);
		expect(track?.dataset.carouselInitialized).toBe('true');

		firstCleanup();

		expect(track?.querySelectorAll('.opinie-card')).toHaveLength(3);
		expect(track?.dataset.carouselInitialized).toBeUndefined();
	});

	it('updates dots, locks navigation during transitions, and recovers on transition end', () => {
		cleanups.push(initializeCarousel());
		const track = document.querySelector<HTMLElement>('.opinie-cards-track');
		const nextButton = document.querySelector<HTMLButtonElement>('.opinie-nav-right');
		const dots = Array.from(document.querySelectorAll<HTMLButtonElement>('.opinie-dot'));

		expect(dots[1].getAttribute('aria-current')).toBe('true');

		nextButton?.click();
		expect(dots[2].getAttribute('aria-current')).toBe('true');
		const firstTransform = track?.style.transform;

		nextButton?.click();
		expect(track?.style.transform).toBe(firstTransform);

		track?.dispatchEvent(new Event('transitionend'));
		nextButton?.click();
		expect(dots[0].getAttribute('aria-current')).toBe('true');
	});

	it('recovers from a missing transition event using the timeout', () => {
		cleanups.push(initializeCarousel());
		const track = document.querySelector<HTMLElement>('.opinie-cards-track');
		const nextButton = document.querySelector<HTMLButtonElement>('.opinie-nav-right');

		nextButton?.click();
		const firstTransform = track?.style.transform;
		vi.advanceTimersByTime(950);
		nextButton?.click();

		expect(track?.style.transform).not.toBe(firstTransform);
	});

	it('navigates to the selected dot', () => {
		cleanups.push(initializeCarousel());
		const dots = Array.from(document.querySelectorAll<HTMLButtonElement>('.opinie-dot'));

		dots[0].click();

		expect(dots[0].getAttribute('aria-current')).toBe('true');
		expect(dots[1].hasAttribute('aria-current')).toBe(false);
	});

	it('clears autoplay and transition timers during cleanup', () => {
		const cleanup = initializeCarousel();
		cleanups.push(cleanup);
		const nextButton = document.querySelector<HTMLButtonElement>('.opinie-nav-right');

		nextButton?.click();
		expect(vi.getTimerCount()).toBeGreaterThan(0);

		cleanup();

		expect(vi.getTimerCount()).toBe(0);
	});
});
