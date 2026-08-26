import { describe, expect, it } from 'vitest';
import { createBaseStructuredData, createHomepageStructuredData } from './structuredData';

const siteUrl = 'https://notabenesztuka.pl';

describe('structured data', () => {
	it('links the website to the tutoring business', () => {
		const nodes = createBaseStructuredData(siteUrl);
		const website = nodes.find((node) => node['@type'] === 'WebSite');
		const business = nodes.find((node) => node['@type'] === 'ProfessionalService');

		expect(website).toMatchObject({
			'@id': `${siteUrl}#website`,
			inLanguage: 'pl-PL',
			publisher: { '@id': `${siteUrl}#business` },
		});
		expect(business).toMatchObject({
			'@id': `${siteUrl}#business`,
			name: 'Nota Bene Sztuka',
			legalName: 'Marta Miller Nota Bene Sztuka',
			taxID: '8982329532',
		});
	});

	it('describes only the visible online tutoring services', () => {
		const nodes = createHomepageStructuredData(siteUrl);
		const catalog = nodes.find((node) => node['@type'] === 'OfferCatalog');
		const offers = catalog?.itemListElement;

		expect(catalog).toMatchObject({
			name: 'Oferta korepetycji z historii sztuki',
		});
		expect(offers).toHaveLength(3);
		expect(offers).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					itemOffered: expect.objectContaining({
						name: 'Korepetycje indywidualne z historii sztuki online',
						provider: { '@id': `${siteUrl}#business` },
					}),
				}),
			])
		);
	});
});
