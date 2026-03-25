export function initHeaderColor(): void {
	const header = document.querySelector<HTMLElement>('.site-header');

	if (!header) return;

	function updateHeaderColor(): void {
		if (window.scrollY === 0) {
			if (!header!.classList.replace('dark', 'light')) header!.classList.add('light');
		} else {
			if (!header!.classList.replace('light', 'dark')) header!.classList.add('dark');
		}
	}

	window.addEventListener('scroll', updateHeaderColor, { passive: true });
	updateHeaderColor();
}
