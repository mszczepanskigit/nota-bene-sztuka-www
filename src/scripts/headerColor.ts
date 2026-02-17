export function initHeaderColor(): void {
	const header = document.querySelector<HTMLElement>('.site-header');
	const hero = document.querySelector<HTMLElement>('.hero');

	function updateHeaderColor(): void {
		if (!header || !hero) return;

		const heroRect: DOMRect = hero.getBoundingClientRect();
		const heroBottom: number = heroRect.bottom;

		if (heroBottom > 0) {
			header.classList.remove('dark');
			header.classList.add('light');
		} else {
			header.classList.remove('light');
			header.classList.add('dark');
		}
	}

	window.addEventListener('scroll', updateHeaderColor);

	updateHeaderColor();
}

