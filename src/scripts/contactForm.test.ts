// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initContactForm } from './contactForm';

function submitForm(form: HTMLFormElement): void {
	form.dispatchEvent(new SubmitEvent('submit', { bubbles: true, cancelable: true }));
}

describe('initContactForm', () => {
	const cleanups: Array<() => void> = [];
	const fetchMock = vi.fn();

	beforeEach(() => {
		document.body.innerHTML = `
			<form id="kontakt-form">
				<input type="hidden" name="access_key" value="public-test-key" />
				<input type="checkbox" name="botcheck" />
				<input type="text" name="name" />
				<button type="submit">Wyślij wiadomość</button>
			</form>
			<div id="form-status" class="form-status"></div>
		`;
		vi.stubGlobal('fetch', fetchMock);
		vi.spyOn(console, 'error').mockImplementation(() => undefined);
	});

	afterEach(() => {
		cleanups
			.splice(0)
			.reverse()
			.forEach((cleanup) => cleanup());
		fetchMock.mockReset();
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('does nothing when required elements are absent', () => {
		document.body.innerHTML = '';
		expect(initContactForm()).toBeUndefined();
	});

	it('submits once, renders success, resets the form, and restores the button', async () => {
		fetchMock.mockResolvedValue(
			new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { 'content-type': 'application/json' },
			})
		);
		const cleanup = initContactForm();
		if (cleanup) cleanups.push(cleanup);
		const form = document.querySelector<HTMLFormElement>('#kontakt-form');
		const button = document.querySelector<HTMLButtonElement>('button[type="submit"]');
		const nameInput = document.querySelector<HTMLInputElement>('input[name="name"]');
		const status = document.querySelector<HTMLElement>('#form-status');

		if (!form || !nameInput) throw new Error('Test form controls not found');
		nameInput.value = 'Jan Kowalski';
		submitForm(form);

		expect(button?.disabled).toBe(true);
		expect(button?.textContent).toBe('Wysyłanie...');

		await vi.waitFor(() => {
			expect(status?.className).toBe('form-status success');
		});

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(status?.textContent).toContain('Wiadomość została wysłana');
		expect(nameInput?.value).toBe('');
		expect(button?.disabled).toBe(false);
		expect(button?.textContent).toBe('Wyślij wiadomość');
	});

	it.each([
		{
			name: 'an API rejection',
			response: new Response(JSON.stringify({ success: false, message: 'Rejected' }), {
				status: 400,
				headers: { 'content-type': 'application/json' },
			}),
		},
		{
			name: 'an invalid API response',
			response: new Response(JSON.stringify({ unexpected: true }), {
				status: 200,
				headers: { 'content-type': 'application/json' },
			}),
		},
	])('renders an error for $name and restores the button', async ({ response }) => {
		fetchMock.mockResolvedValue(response);
		const cleanup = initContactForm();
		if (cleanup) cleanups.push(cleanup);
		const form = document.querySelector<HTMLFormElement>('#kontakt-form');
		const button = document.querySelector<HTMLButtonElement>('button[type="submit"]');
		const status = document.querySelector<HTMLElement>('#form-status');

		if (!form) throw new Error('Test form not found');
		submitForm(form);

		await vi.waitFor(() => {
			expect(status?.className).toBe('form-status error');
		});

		expect(status?.textContent).toContain('Wystąpił błąd');
		expect(button?.disabled).toBe(false);
		expect(button?.textContent).toBe('Wyślij wiadomość');
		expect(console.error).toHaveBeenCalledOnce();
	});

	it('renders an error after a network failure', async () => {
		fetchMock.mockRejectedValue(new Error('Network unavailable'));
		const cleanup = initContactForm();
		if (cleanup) cleanups.push(cleanup);
		const form = document.querySelector<HTMLFormElement>('#kontakt-form');
		const status = document.querySelector<HTMLElement>('#form-status');

		if (!form) throw new Error('Test form not found');
		submitForm(form);

		await vi.waitFor(() => {
			expect(status?.className).toBe('form-status error');
		});

		expect(status?.textContent).toContain('Wystąpił błąd');
		expect(console.error).toHaveBeenCalledOnce();
	});

	it('rejects the honeypot without making a network request', async () => {
		const cleanup = initContactForm();
		if (cleanup) cleanups.push(cleanup);
		const form = document.querySelector<HTMLFormElement>('#kontakt-form');
		const botcheck = document.querySelector<HTMLInputElement>('input[name="botcheck"]');
		const status = document.querySelector<HTMLElement>('#form-status');

		if (!form || !botcheck) throw new Error('Test form controls not found');
		botcheck.checked = true;
		submitForm(form);

		await vi.waitFor(() => {
			expect(status?.className).toBe('form-status error');
		});

		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('registers only one submit handler', async () => {
		fetchMock.mockResolvedValue(
			new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { 'content-type': 'application/json' },
			})
		);
		const firstCleanup = initContactForm();
		if (firstCleanup) cleanups.push(firstCleanup);
		expect(initContactForm()).toBeUndefined();
		const form = document.querySelector<HTMLFormElement>('#kontakt-form');

		if (!form) throw new Error('Test form not found');
		submitForm(form);

		await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
	});
});
