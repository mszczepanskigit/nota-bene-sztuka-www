// Testimonial carousel
// Desktop (≥1024px): 3 cards visible (CVB), X and N fading on edges
// Tablet (768-1023px): 2 cards visible (CV), X and B fading on edges
// Mobile (<768px): 1 card (V) visible, arrows on sides

export const initTestimonialCarousel = (): void => {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
};

function init(): void {
	const track = document.querySelector('.opinie-cards-track') as HTMLElement | null;
	const carousel = document.querySelector('.opinie-carousel') as HTMLElement | null;
	const prevBtn = document.querySelector('.opinie-nav-left') as HTMLButtonElement | null;
	const nextBtn = document.querySelector('.opinie-nav-right') as HTMLButtonElement | null;
	const dots = document.querySelectorAll('.opinie-dot') as NodeListOf<HTMLButtonElement>;

	if (!track || !carousel || !prevBtn || !nextBtn) return;

	if (track.dataset.carouselInit === 'true') return;
	track.dataset.carouselInit = 'true';

	const originalCards = Array.from(track.querySelectorAll('.opinie-card')) as HTMLElement[];
	const totalOriginal = originalCards.length;

	if (totalOriginal === 0) return;

	// Clone the full set once before and once after the originals.
	const clonesBefore: HTMLElement[] = [];
	const clonesAfter: HTMLElement[] = [];

	for (let i = 0; i < totalOriginal; i++) {
		const cloneBefore = originalCards[i].cloneNode(true) as HTMLElement;
		const cloneAfter = originalCards[i].cloneNode(true) as HTMLElement;
		cloneBefore.setAttribute('aria-hidden', 'true');
		cloneAfter.setAttribute('aria-hidden', 'true');
		clonesBefore.push(cloneBefore);
		clonesAfter.push(cloneAfter);
	}

	// Insert clones: [clone0..4] [original0..4] [clone0..4]
	for (let i = clonesBefore.length - 1; i >= 0; i--) {
		track.insertBefore(clonesBefore[i], track.firstChild);
	}
	for (const clone of clonesAfter) {
		track.appendChild(clone);
	}

	// Measure card width + gap
	const allCards = Array.from(track.querySelectorAll('.opinie-card')) as HTMLElement[];

	const computeStep = (): number => {
		const card = allCards[0];
		const style = getComputedStyle(track);
		const gap = parseFloat(style.gap) || 16;
		return card.offsetWidth + gap;
	};

	/**
	 * Compute the centering offset based on viewport width.
	 * Desktop (≥1024px): center single active card → offset = (carouselWidth - cardWidth) / 2
	 * Tablet (768-1023px): center pair of cards (active & next) → offset = (carouselWidth - 2*cardWidth - gap) / 2
	 * Mobile (<768px): center single active card → offset = (carouselWidth - cardWidth) / 2
	 */
	const computeCenterOffset = (): number => {
		const carouselWidth = carousel.offsetWidth;
		const card = allCards[0];
		const cardWidth = card.offsetWidth;
		const style = getComputedStyle(track);
		const gap = parseFloat(style.gap) || 16;
		const vw = window.innerWidth;

		if (vw >= 768 && vw < 1024) {
			// Tablet: center 2 cards (active + next)
			return (carouselWidth - 2 * cardWidth - gap) / 2;
		} else {
			// Desktop & mobile: center 1 card
			return (carouselWidth - cardWidth) / 2;
		}
	};

	let step = computeStep();
	let centerOffset = computeCenterOffset();
	let transitionTimeout: number | undefined;

	// position tracks the logical index in the track array.
	// Clones before = totalOriginal cards, so original[i] is at track index (totalOriginal + i).
	// Desktop/mobile: start at middle card (index 2 = V).
	// Tablet: start at card index 1 (C) so that CV are centered.
	const getInitialPosition = (): number => {
		const vw = window.innerWidth;
		if (vw >= 768 && vw < 1024) {
			return totalOriginal + 1; // C
		}
		return totalOriginal + Math.floor(totalOriginal / 2); // V (middle)
	};

	let position = getInitialPosition();
	let isTransitioning = false;

	const setTranslate = (animate: boolean): void => {
		if (!track) return;
		const offset = -(position * step) + centerOffset;
		if (animate) {
			track.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
		} else {
			track.style.transition = 'none';
		}
		track.style.transform = `translateX(${offset}px)`;
	};

	const updateDots = (): void => {
		const realIndex = ((position % totalOriginal) + totalOriginal) % totalOriginal;
		dots.forEach((dot, i) => {
			dot.classList.toggle('active', i === realIndex);
		});
	};

	// Initial position (no animation)
	setTranslate(false);
	updateDots();

	// After a transition ends, silently jump back to canonical range if needed
	track.addEventListener('transitionend', () => {
		isTransitioning = false;
		if (transitionTimeout) {
			window.clearTimeout(transitionTimeout);
			transitionTimeout = undefined;
		}

		if (position >= totalOriginal * 2) {
			position -= totalOriginal;
			setTranslate(false);
		} else if (position < totalOriginal) {
			position += totalOriginal;
			setTranslate(false);
		}

		updateDots();
	});

	const beginTransition = (): void => {
		if (transitionTimeout) {
			window.clearTimeout(transitionTimeout);
		}
		transitionTimeout = window.setTimeout(() => {
			isTransitioning = false;
			updateDots();
		}, 950);
	};

	const goNext = (): void => {
		if (isTransitioning) return;
		isTransitioning = true;
		step = computeStep();
		centerOffset = computeCenterOffset();
		position++;
		setTranslate(true);
		updateDots();
		beginTransition();
	};

	const goPrev = (): void => {
		if (isTransitioning) return;
		isTransitioning = true;
		step = computeStep();
		centerOffset = computeCenterOffset();
		position--;
		setTranslate(true);
		updateDots();
		beginTransition();
	};

	const goTo = (index: number): void => {
		if (isTransitioning) return;
		isTransitioning = true;
		step = computeStep();
		centerOffset = computeCenterOffset();
		position = totalOriginal + index;
		setTranslate(true);
		updateDots();
		beginTransition();
	};

	nextBtn.addEventListener('click', () => {
		goNext();
		resetAutoPlay();
	});

	prevBtn.addEventListener('click', () => {
		goPrev();
		resetAutoPlay();
	});

	dots.forEach((dot) => {
		dot.addEventListener('click', () => {
			const targetIndex = parseInt(dot.getAttribute('data-index') || '0', 10);
			goTo(targetIndex);
			resetAutoPlay();
		});
	});

	// Auto-play
	let autoPlayInterval = setInterval(goNext, 8000);

	function resetAutoPlay(): void {
		clearInterval(autoPlayInterval);
		autoPlayInterval = setInterval(goNext, 8000);
	}

	// Pause on hover
	const wrapper = document.querySelector('.opinie-carousel-wrapper') as HTMLElement | null;
	if (wrapper) {
		wrapper.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
		wrapper.addEventListener('mouseleave', () => resetAutoPlay());
	}

	// Recalculate on window resize
	window.addEventListener('resize', () => {
		step = computeStep();
		centerOffset = computeCenterOffset();
		setTranslate(false);
	});
}
