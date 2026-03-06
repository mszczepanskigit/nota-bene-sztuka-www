// Mobile hamburger menu toggle with floating overlay

export const initMobileMenu = (): void => {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
};

function init(): void {
	const menuToggle = document.querySelector('.menu-toggle') as HTMLButtonElement | null;
	const navMobile = document.querySelector('.nav-mobile') as HTMLElement | null;
	const backdrop = document.querySelector('.mobile-menu-backdrop') as HTMLElement | null;
	const navMobileLinks = document.querySelectorAll('.nav-mobile a') as NodeListOf<HTMLAnchorElement>;

	if (!menuToggle || !navMobile || !backdrop) return;

	const closeMenu = (): void => {
		menuToggle.classList.remove('active');
		navMobile.classList.remove('active');
		backdrop.classList.remove('active');
		menuToggle.setAttribute('aria-expanded', 'false');
	};

	const openMenu = (): void => {
		menuToggle.classList.add('active');
		navMobile.classList.add('active');
		backdrop.classList.add('active');
		menuToggle.setAttribute('aria-expanded', 'true');
	};

	menuToggle.addEventListener('click', () => {
		if (menuToggle.classList.contains('active')) {
			closeMenu();
		} else {
			openMenu();
		}
	});

	navMobileLinks.forEach((link) => {
		link.addEventListener('click', () => {
			closeMenu();
		});
	});

	backdrop.addEventListener('click', () => {
		closeMenu();
	});
}

