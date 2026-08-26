type Cleanup = () => void;

export const initMobileMenu = (): Cleanup => {
	let cleanup: Cleanup | undefined;

	const initialize = (): void => {
		cleanup = initializeMobileMenu();
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

function initializeMobileMenu(): Cleanup | undefined {
	const menuToggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
	const navMobile = document.querySelector<HTMLElement>('.nav-mobile');
	const backdrop = document.querySelector<HTMLElement>('.mobile-menu-backdrop');
	const navMobileLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav-mobile a'));

	if (
		!menuToggle ||
		!navMobile ||
		!backdrop ||
		menuToggle.dataset.mobileMenuInitialized === 'true'
	) {
		return;
	}

	menuToggle.dataset.mobileMenuInitialized = 'true';
	navMobile.inert = true;
	navMobile.setAttribute('aria-hidden', 'true');
	backdrop.setAttribute('aria-hidden', 'true');

	let bodyOverflowBeforeOpen = '';

	const isOpen = (): boolean => menuToggle.getAttribute('aria-expanded') === 'true';

	const closeMenu = (restoreFocus: boolean): void => {
		if (!isOpen()) return;

		menuToggle.classList.remove('active');
		navMobile.classList.remove('active');
		backdrop.classList.remove('active');
		menuToggle.setAttribute('aria-expanded', 'false');
		menuToggle.setAttribute('aria-label', 'Otwórz menu');
		navMobile.setAttribute('aria-hidden', 'true');
		backdrop.setAttribute('aria-hidden', 'true');
		navMobile.inert = true;
		document.body.style.overflow = bodyOverflowBeforeOpen;

		if (restoreFocus) {
			menuToggle.focus();
		}
	};

	const openMenu = (): void => {
		if (isOpen()) return;

		bodyOverflowBeforeOpen = document.body.style.overflow;
		menuToggle.classList.add('active');
		navMobile.classList.add('active');
		backdrop.classList.add('active');
		menuToggle.setAttribute('aria-expanded', 'true');
		menuToggle.setAttribute('aria-label', 'Zamknij menu');
		navMobile.setAttribute('aria-hidden', 'false');
		backdrop.setAttribute('aria-hidden', 'false');
		navMobile.inert = false;
		document.body.style.overflow = 'hidden';
		navMobileLinks[0]?.focus();
	};

	const handleToggleClick = (): void => {
		if (isOpen()) {
			closeMenu(false);
		} else {
			openMenu();
		}
	};

	const handleLinkClick = (): void => closeMenu(true);
	const handleBackdropClick = (): void => closeMenu(true);

	const handleDocumentKeydown = (event: KeyboardEvent): void => {
		if (!isOpen()) return;

		if (event.key === 'Escape') {
			event.preventDefault();
			closeMenu(true);
			return;
		}

		if (event.key !== 'Tab') return;

		const focusableElements: HTMLElement[] = [menuToggle, ...navMobileLinks];
		const firstElement = focusableElements[0];
		const lastElement = focusableElements.at(-1);

		if (event.shiftKey && document.activeElement === firstElement) {
			event.preventDefault();
			lastElement?.focus();
		} else if (!event.shiftKey && document.activeElement === lastElement) {
			event.preventDefault();
			firstElement?.focus();
		}
	};

	menuToggle.addEventListener('click', handleToggleClick);
	navMobileLinks.forEach((link) => link.addEventListener('click', handleLinkClick));
	backdrop.addEventListener('click', handleBackdropClick);
	document.addEventListener('keydown', handleDocumentKeydown);

	return () => {
		closeMenu(false);
		menuToggle.removeEventListener('click', handleToggleClick);
		navMobileLinks.forEach((link) => link.removeEventListener('click', handleLinkClick));
		backdrop.removeEventListener('click', handleBackdropClick);
		document.removeEventListener('keydown', handleDocumentKeydown);
		delete menuToggle.dataset.mobileMenuInitialized;
	};
}
