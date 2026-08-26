export function initHeaderColor(): (() => void) | undefined {
	const header = document.querySelector<HTMLElement>('.site-header');

	if (!header || header.dataset.headerColorInitialized === 'true') return;

	header.dataset.headerColorInitialized = 'true';

	const updateHeaderColor = (): void => {
		const isAtTop = window.scrollY === 0;
		header.classList.toggle('light', isAtTop);
		header.classList.toggle('dark', !isAtTop);
	};

	window.addEventListener('scroll', updateHeaderColor, { passive: true });
	updateHeaderColor();

	return () => {
		window.removeEventListener('scroll', updateHeaderColor);
		delete header.dataset.headerColorInitialized;
	};
}
