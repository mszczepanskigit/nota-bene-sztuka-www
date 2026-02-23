// Contact form placeholder handler
export const initContactForm = (): void => {
	const form = document.querySelector('#kontakt-form') as HTMLFormElement | null;
	if (!form) return;

	if (form.dataset.submitHandler === 'true') return;
	form.dataset.submitHandler = 'true';

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		alert('Formularz będzie dostępny wkrótce.');
	});
};

