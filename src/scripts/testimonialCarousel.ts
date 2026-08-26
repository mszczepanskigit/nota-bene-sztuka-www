type Cleanup = () => void;

export const initTestimonialCarousel = (): Cleanup => {
	let cleanup: Cleanup | undefined;

	const initialize = (): void => {
		cleanup = initializeTestimonialCarousel();
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initialize, { once: true });
	} else {
		initialize();
	}

	return () => {
		document.removeEventListener('DOMContentLoaded', initialize);
		cleanup?.();
	};
};

function initializeTestimonialCarousel(): Cleanup | undefined {
	const track = document.querySelector<HTMLElement>('.opinie-cards-track');
	const carousel = document.querySelector<HTMLElement>('.opinie-carousel');
	const previousButton = document.querySelector<HTMLButtonElement>('.opinie-nav-left');
	const nextButton = document.querySelector<HTMLButtonElement>('.opinie-nav-right');
	const dots = Array.from(document.querySelectorAll<HTMLButtonElement>('.opinie-dot'));
	const wrapper = document.querySelector<HTMLElement>('.opinie-carousel-wrapper');

	if (
		!track ||
		!carousel ||
		!previousButton ||
		!nextButton ||
		track.dataset.carouselInitialized === 'true'
	) {
		return;
	}

	const originalCards = Array.from(track.querySelectorAll<HTMLElement>('.opinie-card'));
	const totalOriginalCards = originalCards.length;

	if (totalOriginalCards === 0) return;

	track.dataset.carouselInitialized = 'true';

	const cloneCard = (card: HTMLElement): HTMLElement => {
		const clone = card.cloneNode(true);

		if (!(clone instanceof HTMLElement)) {
			throw new TypeError('Expected a cloned testimonial card to be an HTMLElement');
		}

		return clone;
	};

	const clonesBefore = originalCards.map(cloneCard);
	const clonesAfter = originalCards.map(cloneCard);

	[...clonesBefore, ...clonesAfter].forEach((clone) => {
		clone.setAttribute('aria-hidden', 'true');
	});

	for (let index = clonesBefore.length - 1; index >= 0; index--) {
		track.insertBefore(clonesBefore[index], track.firstChild);
	}

	clonesAfter.forEach((clone) => track.appendChild(clone));

	const allCards = Array.from(track.querySelectorAll<HTMLElement>('.opinie-card'));

	const computeStep = (): number => {
		const gap = Number.parseFloat(getComputedStyle(track).gap) || 16;
		return allCards[0].offsetWidth + gap;
	};

	const computeCenterOffset = (): number => {
		const cardWidth = allCards[0].offsetWidth;
		const gap = Number.parseFloat(getComputedStyle(track).gap) || 16;

		if (window.innerWidth >= 768 && window.innerWidth < 1024) {
			return (carousel.offsetWidth - 2 * cardWidth - gap) / 2;
		}

		return (carousel.offsetWidth - cardWidth) / 2;
	};

	const getInitialPosition = (): number => {
		if (window.innerWidth >= 768 && window.innerWidth < 1024) {
			return totalOriginalCards + 1;
		}

		return totalOriginalCards + Math.floor(totalOriginalCards / 2);
	};

	let step = computeStep();
	let centerOffset = computeCenterOffset();
	let position = getInitialPosition();
	let isTransitioning = false;
	let transitionTimeout: number | undefined;
	let autoPlayInterval: number | undefined;

	const setTranslate = (animate: boolean): void => {
		const offset = -(position * step) + centerOffset;
		track.style.transition = animate
			? 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
			: 'none';
		track.style.transform = `translateX(${offset}px)`;
	};

	const updateDots = (): void => {
		const realIndex = ((position % totalOriginalCards) + totalOriginalCards) % totalOriginalCards;

		dots.forEach((dot, index) => {
			const isActive = index === realIndex;
			dot.classList.toggle('active', isActive);

			if (isActive) {
				dot.setAttribute('aria-current', 'true');
			} else {
				dot.removeAttribute('aria-current');
			}
		});
	};

	const finishTransition = (): void => {
		isTransitioning = false;

		if (transitionTimeout !== undefined) {
			window.clearTimeout(transitionTimeout);
			transitionTimeout = undefined;
		}

		if (position >= totalOriginalCards * 2) {
			position -= totalOriginalCards;
			setTranslate(false);
		} else if (position < totalOriginalCards) {
			position += totalOriginalCards;
			setTranslate(false);
		}

		updateDots();
	};

	const beginTransition = (): void => {
		if (transitionTimeout !== undefined) {
			window.clearTimeout(transitionTimeout);
		}

		transitionTimeout = window.setTimeout(finishTransition, 950);
	};

	const goToPosition = (nextPosition: number): void => {
		if (isTransitioning) return;

		isTransitioning = true;
		step = computeStep();
		centerOffset = computeCenterOffset();
		position = nextPosition;
		setTranslate(true);
		updateDots();
		beginTransition();
	};

	const goNext = (): void => goToPosition(position + 1);
	const goPrevious = (): void => goToPosition(position - 1);

	const stopAutoPlay = (): void => {
		if (autoPlayInterval !== undefined) {
			window.clearInterval(autoPlayInterval);
			autoPlayInterval = undefined;
		}
	};

	const startAutoPlay = (): void => {
		stopAutoPlay();
		autoPlayInterval = window.setInterval(goNext, 8000);
	};

	const handleNextClick = (): void => {
		goNext();
		startAutoPlay();
	};

	const handlePreviousClick = (): void => {
		goPrevious();
		startAutoPlay();
	};

	const dotHandlers = dots.map((dot) => {
		const handler = (): void => {
			const targetIndex = Number.parseInt(dot.dataset.index ?? '0', 10);
			goToPosition(totalOriginalCards + targetIndex);
			startAutoPlay();
		};

		dot.addEventListener('click', handler);
		return { dot, handler };
	});

	const handleMouseEnter = (): void => stopAutoPlay();
	const handleMouseLeave = (): void => startAutoPlay();

	const handleResize = (): void => {
		step = computeStep();
		centerOffset = computeCenterOffset();
		setTranslate(false);
	};

	setTranslate(false);
	updateDots();

	track.addEventListener('transitionend', finishTransition);
	nextButton.addEventListener('click', handleNextClick);
	previousButton.addEventListener('click', handlePreviousClick);
	wrapper?.addEventListener('mouseenter', handleMouseEnter);
	wrapper?.addEventListener('mouseleave', handleMouseLeave);
	window.addEventListener('resize', handleResize);
	startAutoPlay();

	return () => {
		stopAutoPlay();

		if (transitionTimeout !== undefined) {
			window.clearTimeout(transitionTimeout);
		}

		track.removeEventListener('transitionend', finishTransition);
		nextButton.removeEventListener('click', handleNextClick);
		previousButton.removeEventListener('click', handlePreviousClick);
		dotHandlers.forEach(({ dot, handler }) => dot.removeEventListener('click', handler));
		wrapper?.removeEventListener('mouseenter', handleMouseEnter);
		wrapper?.removeEventListener('mouseleave', handleMouseLeave);
		window.removeEventListener('resize', handleResize);
		[...clonesBefore, ...clonesAfter].forEach((clone) => clone.remove());
		track.style.removeProperty('transition');
		track.style.removeProperty('transform');
		delete track.dataset.carouselInitialized;
	};
}
