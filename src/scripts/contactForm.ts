interface Web3FormsResponse {
	success: boolean;
	message?: string;
}

function isWeb3FormsResponse(value: unknown): value is Web3FormsResponse {
	return (
		typeof value === 'object' &&
		value !== null &&
		'success' in value &&
		typeof value.success === 'boolean' &&
		(!('message' in value) || value.message === undefined || typeof value.message === 'string')
	);
}

export const initContactForm = (): (() => void) | undefined => {
	const form = document.querySelector<HTMLFormElement>('#kontakt-form');
	const submitButton = form?.querySelector<HTMLButtonElement>('button[type="submit"]');
	const status = document.querySelector<HTMLDivElement>('#form-status');

	if (!form || !submitButton || !status || form.dataset.submitHandler === 'true') return;

	form.dataset.submitHandler = 'true';
	const initialButtonText = submitButton.textContent;

	const handleSubmit = async (event: SubmitEvent): Promise<void> => {
		event.preventDefault();
		submitButton.disabled = true;
		submitButton.textContent = 'Wysyłanie...';
		status.className = 'form-status';
		status.textContent = '';

		try {
			const formData = new FormData(form);

			if (formData.get('botcheck')) {
				throw new Error('Spam detected');
			}

			const response = await fetch('https://api.web3forms.com/submit', {
				method: 'POST',
				body: formData,
			});
			const responseData: unknown = await response.json();

			if (!isWeb3FormsResponse(responseData)) {
				throw new Error('Invalid Web3Forms response');
			}

			if (!response.ok || !responseData.success) {
				throw new Error(responseData.message || 'Contact form submission failed');
			}

			status.className = 'form-status success';
			status.textContent = 'Dziękujemy! Wiadomość została wysłana. Odezwiemy się wkrótce.';
			form.reset();
		} catch (error) {
			status.className = 'form-status error';
			status.textContent =
				'Wystąpił błąd. Spróbuj ponownie lub skontaktuj się bezpośrednio przez e-mail.';
			console.error('Form submission error:', error);
		} finally {
			submitButton.disabled = false;
			submitButton.textContent = initialButtonText;
		}
	};

	form.addEventListener('submit', handleSubmit);

	return () => {
		form.removeEventListener('submit', handleSubmit);
		delete form.dataset.submitHandler;
	};
};
