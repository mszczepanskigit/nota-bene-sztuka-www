import { describe, expect, it } from 'vitest';
import { validateDeploymentConfig, type DeploymentEnvironment } from './deploymentConfig';

const validConfiguration: DeploymentEnvironment = {
	VERCEL_ENV: 'preview',
	PUBLIC_WEBINAR_FORM_URL: 'https://forms.example.org/notabene',
	PUBLIC_WEB3FORMS_KEY: 'configured-public-access-key',
};

describe('validateDeploymentConfig', () => {
	it.each([undefined, 'development'])(
		'skips validation outside Vercel preview and production for %s',
		(vercelEnvironment) => {
			expect(() =>
				validateDeploymentConfig({
					VERCEL_ENV: vercelEnvironment,
				})
			).not.toThrow();
		}
	);

	it.each(['preview', 'production'])('accepts valid %s configuration', (vercelEnvironment) => {
		expect(() =>
			validateDeploymentConfig({
				...validConfiguration,
				VERCEL_ENV: vercelEnvironment,
			})
		).not.toThrow();
	});

	it('reports both missing variables without exposing their values', () => {
		expect(() => validateDeploymentConfig({ VERCEL_ENV: 'production' })).toThrow(
			'Invalid Vercel production configuration: PUBLIC_WEBINAR_FORM_URL, PUBLIC_WEB3FORMS_KEY'
		);
	});

	it.each([
		'not-a-url',
		'http://forms.example.org/notabene',
		'https://example.com/form',
		'https://forms.example.com/form',
	])('rejects an invalid webinar URL: %s', (webinarUrl) => {
		expect(() =>
			validateDeploymentConfig({
				...validConfiguration,
				PUBLIC_WEBINAR_FORM_URL: webinarUrl,
			})
		).toThrow('PUBLIC_WEBINAR_FORM_URL');
	});

	it.each(['', '   ', 'replace-with-a-public-web3forms-access-key'])(
		'rejects an invalid Web3Forms key without including it in the error: %s',
		(web3FormsKey) => {
			let error: Error | undefined;

			try {
				validateDeploymentConfig({
					...validConfiguration,
					PUBLIC_WEB3FORMS_KEY: web3FormsKey,
				});
			} catch (caughtError) {
				error = caughtError instanceof Error ? caughtError : undefined;
			}

			expect(error?.message).toContain('PUBLIC_WEB3FORMS_KEY');
			expect(error?.message).not.toContain(web3FormsKey || 'configured-public-access-key');
		}
	);
});
