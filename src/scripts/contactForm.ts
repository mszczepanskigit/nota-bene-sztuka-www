// Contact form handler with Web3Forms integration
export const initContactForm = (): void => {
	const form = document.querySelector('#kontakt-form') as HTMLFormElement | null;
	if (!form) return;

	// Prevent double initialization
	if (form.dataset.submitHandler === 'true') return;
	form.dataset.submitHandler = 'true';

	const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
	const statusDiv = document.querySelector('#form-status') as HTMLDivElement;

	form.addEventListener('submit', async (event) => {
		event.preventDefault();

		// Disable submit button to prevent double submission
		if (submitButton) {
			submitButton.disabled = true;
			submitButton.textContent = 'Wysyłanie...';
		}

		// Clear previous status
		if (statusDiv) {
			statusDiv.className = 'form-status';
			statusDiv.textContent = '';
		}

		try {
			const formData = new FormData(form);

			// Check honeypot (spam protection)
			const botcheck = formData.get('botcheck');
			if (botcheck) {
				throw new Error('Spam detected');
			}

			const response = await fetch('https://api.web3forms.com/submit', {
				method: 'POST',
				body: formData,
			});

			const data = await response.json();

			if (response.ok && data.success) {
				// Success
				if (statusDiv) {
					statusDiv.className = 'form-status success';
					statusDiv.textContent = 'Dziękujemy! Wiadomość została wysłana. Odezwiemy się wkrótce.';
				}
				form.reset();
			} else {
				throw new Error(data.message || 'Błąd wysyłania formularza');
			}
		} catch (error) {
			// Error
			if (statusDiv) {
				statusDiv.className = 'form-status error';
				statusDiv.textContent = 'Wystąpił błąd. Spróbuj ponownie lub skontaktuj się bezpośrednio przez e-mail.';
			}
			console.error('Form submission error:', error);
		} finally {
			// Re-enable submit button
			if (submitButton) {
				submitButton.disabled = false;
				submitButton.textContent = 'Wyślij wiadomość';
			}
		}
	});
};

