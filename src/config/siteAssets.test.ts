import sharp from 'sharp';
import { access, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const publicDirectory = new URL('../../public/', import.meta.url);

function getAssetPath(assetName: string): string {
	return fileURLToPath(new URL(assetName, publicDirectory));
}

describe('site identity and sharing assets', () => {
	it.each([
		['og-image.webp', 'webp', 1200, 630],
		['og-image.jpg', 'jpeg', 1200, 630],
		['favicon-48.png', 'png', 48, 48],
		['apple-touch-icon.png', 'png', 180, 180],
		['favicon-192.png', 'png', 192, 192],
		['favicon-512.png', 'png', 512, 512],
		['webinar4.webp', 'webp', 1605, 903],
	])(
		'provides %s as a %s image with the expected dimensions',
		async (name, format, width, height) => {
			const metadata = await sharp(getAssetPath(name)).metadata();

			expect(metadata).toMatchObject({ format, width, height });
		}
	);

	it('describes the generated app icons in the web manifest', async () => {
		const manifest = JSON.parse(await readFile(getAssetPath('site.webmanifest'), 'utf8')) as {
			icons: Array<{ src: string; sizes: string; type: string }>;
		};

		expect(manifest.icons).toEqual([
			{ src: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
			{ src: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
		]);
	});

	it('keeps an ICO fallback for legacy favicon clients', async () => {
		await access(getAssetPath('favicon.ico'));
	});
});
