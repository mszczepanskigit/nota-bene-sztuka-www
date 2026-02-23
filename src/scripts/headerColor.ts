export function initHeaderColor(): void {
	const header = document.querySelector<HTMLElement>('.site-header');
	const hero = document.querySelector<HTMLElement>('.hero');

	if (!header || !hero) return;

	function updateHeaderColor(): void {
		const heroBottom = hero!.getBoundingClientRect().bottom;

		if (heroBottom > 0) {
			header!.classList.replace('dark', 'light') || header!.classList.add('light');
		} else {
			header!.classList.replace('light', 'dark') || header!.classList.add('dark');
		}
	}

	window.addEventListener('scroll', updateHeaderColor, { passive: true });
	updateHeaderColor();
}
