// Testimonial carousel with infinite loop for 5 cards
// Visible: 5 cards at a time (3 fully visible center + 2 fading on edges)
// Scrolls 1 card at a time, loops infinitely

export const initTestimonialCarousel = (): void => {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
};

function init(): void {
	const track = document.querySelector('.opinie-cards-track') as HTMLElement | null;
	const prevBtn = document.querySelector('.opinie-nav-left') as HTMLButtonElement | null;
	const nextBtn = document.querySelector('.opinie-nav-right') as HTMLButtonElement | null;
	const dots = document.querySelectorAll('.opinie-dot') as NodeListOf<HTMLButtonElement>;

	if (!track || !prevBtn || !nextBtn) return;

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
		const gap = parseFloat(style.gap) || 24;
		return card.offsetWidth + gap;
	};

	let step = computeStep();
	let transitionTimeout: number | undefined;

	// position tracks the logical index in the track array.
	// Start at the first original card (index = totalOriginal because we prepended totalOriginal clones).
	let position = totalOriginal;
	let isTransitioning = false;

	const setTranslate = (animate: boolean): void => {
		if (!track) return;
		const offset = -(position * step);
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
		position++;
		setTranslate(true);
		updateDots();
		beginTransition();
	};

	const goPrev = (): void => {
		if (isTransitioning) return;
		isTransitioning = true;
		step = computeStep();
		position--;
		setTranslate(true);
		updateDots();
		beginTransition();
	};

	const goTo = (index: number): void => {
		if (isTransitioning) return;
		isTransitioning = true;
		step = computeStep();
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
		setTranslate(false);
	});
}
