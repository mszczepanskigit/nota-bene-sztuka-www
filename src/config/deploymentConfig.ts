const VERCEL_DEPLOYMENT_ENVIRONMENTS = new Set(['preview', 'production']);
const PLACEHOLDER_WEBINAR_HOSTS = new Set(['example.com', 'forms.example.com']);
const PLACEHOLDER_WEB3FORMS_KEY = 'replace-with-a-public-web3forms-access-key';

export interface DeploymentEnvironment {
	VERCEL_ENV?: string;
	PUBLIC_WEBINAR_FORM_URL?: string;
	PUBLIC_WEB3FORMS_KEY?: string;
}

function isValidWebinarUrl(value: string | undefined): boolean {
	if (!value) return false;

	try {
		const url = new URL(value);
		return url.protocol === 'https:' && !PLACEHOLDER_WEBINAR_HOSTS.has(url.hostname);
	} catch {
		return false;
	}
}

function isValidWeb3FormsKey(value: string | undefined): boolean {
	const normalizedValue = value?.trim();
	return Boolean(normalizedValue && normalizedValue !== PLACEHOLDER_WEB3FORMS_KEY);
}

export function validateDeploymentConfig(environment: DeploymentEnvironment): void {
	if (!environment.VERCEL_ENV || !VERCEL_DEPLOYMENT_ENVIRONMENTS.has(environment.VERCEL_ENV)) {
		return;
	}

	const invalidVariables: string[] = [];

	if (!isValidWebinarUrl(environment.PUBLIC_WEBINAR_FORM_URL)) {
		invalidVariables.push('PUBLIC_WEBINAR_FORM_URL');
	}

	if (!isValidWeb3FormsKey(environment.PUBLIC_WEB3FORMS_KEY)) {
		invalidVariables.push('PUBLIC_WEB3FORMS_KEY');
	}

	if (invalidVariables.length > 0) {
		throw new Error(
			`Invalid Vercel ${environment.VERCEL_ENV} configuration: ${invalidVariables.join(', ')}`
		);
	}
}
