import { CONTACT_EMAIL, INSTAGRAM_URL, SUPERPROF_URL } from './links';

const BUSINESS_ID_SUFFIX = '#business';
const WEB_SITE_ID_SUFFIX = '#website';
const PERSON_ID_SUFFIX = '#marta-miller';

export interface JsonLdNode {
	'@id'?: string;
	'@type': string | string[];
	[property: string]: unknown;
}

function getBusinessId(siteUrl: string): string {
	return `${siteUrl}${BUSINESS_ID_SUFFIX}`;
}

export function createBaseStructuredData(siteUrl: string): JsonLdNode[] {
	const businessId = getBusinessId(siteUrl);

	return [
		{
			'@type': 'WebSite',
			'@id': `${siteUrl}${WEB_SITE_ID_SUFFIX}`,
			name: 'Nota Bene Sztuka',
			url: siteUrl,
			inLanguage: 'pl-PL',
			publisher: {
				'@id': businessId,
			},
		},
		{
			'@type': 'ProfessionalService',
			'@id': businessId,
			name: 'Nota Bene Sztuka',
			legalName: 'Marta Miller Nota Bene Sztuka',
			url: siteUrl,
			logo: `${siteUrl}/favicon-512.png`,
			email: CONTACT_EMAIL,
			taxID: '8982329532',
			description:
				'Korepetycje z historii sztuki online: przygotowanie do matury, olimpiady i egzaminów wstępnych na studia artystyczne.',
			sameAs: [INSTAGRAM_URL, SUPERPROF_URL],
			contactPoint: {
				'@type': 'ContactPoint',
				email: CONTACT_EMAIL,
				contactType: 'customer service',
				availableLanguage: 'pl',
			},
		},
	];
}

export function createHomepageStructuredData(siteUrl: string): JsonLdNode[] {
	const businessId = getBusinessId(siteUrl);
	const personId = `${siteUrl}${PERSON_ID_SUFFIX}`;

	return [
		{
			'@type': 'Person',
			'@id': personId,
			name: 'Marta Miller',
			jobTitle: 'Historyczka sztuki i nauczycielka',
			worksFor: {
				'@id': businessId,
			},
			knowsAbout: [
				'historia sztuki',
				'przygotowanie do matury z historii sztuki',
				'analiza dzieła sztuki',
				'olimpiada z historii sztuki',
			],
		},
		{
			'@type': 'OfferCatalog',
			'@id': `${siteUrl}#offer-catalog`,
			name: 'Oferta korepetycji z historii sztuki',
			itemListElement: [
				{
					'@type': 'Offer',
					itemOffered: {
						'@type': 'Service',
						name: 'Korepetycje indywidualne z historii sztuki online',
						serviceType: 'Korepetycje z historii sztuki',
						description:
							'Indywidualne zajęcia online przygotowujące do matury, olimpiady i egzaminów wstępnych.',
						provider: {
							'@id': businessId,
						},
						availableChannel: {
							'@type': 'ServiceChannel',
							serviceUrl: siteUrl,
							availableLanguage: 'pl',
						},
					},
				},
				{
					'@type': 'Offer',
					itemOffered: {
						'@type': 'Service',
						name: 'Korepetycje grupowe z historii sztuki online',
						serviceType: 'Korepetycje z historii sztuki',
						description:
							'Zajęcia w małych grupach online, dostosowane do celu i tempa nauki uczestników.',
						provider: {
							'@id': businessId,
						},
						availableChannel: {
							'@type': 'ServiceChannel',
							serviceUrl: siteUrl,
							availableLanguage: 'pl',
						},
					},
				},
				{
					'@type': 'Offer',
					itemOffered: {
						'@type': 'Service',
						name: 'Webinary maturalne z historii sztuki',
						serviceType: 'Webinary edukacyjne',
						description: 'Webinary z historii sztuki wspierające przygotowanie do matury.',
						provider: {
							'@id': businessId,
						},
						availableChannel: {
							'@type': 'ServiceChannel',
							serviceUrl: siteUrl,
							availableLanguage: 'pl',
						},
					},
				},
			],
		},
	];
}
