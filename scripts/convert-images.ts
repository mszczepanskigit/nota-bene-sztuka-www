import sharp from 'sharp';
import { unlink } from 'node:fs/promises';

const publicDir = './public';

// Background images (CSS url references) – keep originals as @supports fallback
const backgroundImages: string[] = ['monalisa.png', 'vangogh.png', 'museum.jpeg'];

// Inline images (used via <Image> component) – originals kept as fallback, webp used as primary
const inlineImages: string[] = ['pisa.jpg', 'orange.png', 'webinar2.png'];

// Obsolete images – convert to webp and DELETE the original (will never be used directly)
const obsoleteImages: string[] = ['obsolete/webinar1.png'];

async function convertToWebP(images: string[], deleteOriginal = false): Promise<void> {
	for (const image of images) {
		const inputPath = `${publicDir}/${image}`;
		const outputPath = `${publicDir}/${image.replace(/\.(png|jpg|jpeg)$/, '.webp')}`;

		try {
			await sharp(inputPath).webp({ quality: 90, effort: 6 }).toFile(outputPath);
			const outputFilename = outputPath.split('/').pop();
			console.log(`  ✓  ${image} → ${outputFilename}`);

			if (deleteOriginal) {
				await unlink(inputPath);
				console.log(`  🗑  Deleted original: ${image}`);
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			console.error(`  ✗  Failed to convert ${image}: ${errorMessage}`);
		}
	}
}

async function main(): Promise<void> {
	console.log('\n=== Converting background images (originals kept as fallback) ===');
	await convertToWebP(backgroundImages);

	console.log('\n=== Converting inline images (originals kept as fallback) ===');
	await convertToWebP(inlineImages);

	console.log('\n=== Converting obsolete images (originals deleted) ===');
	await convertToWebP(obsoleteImages, true);

	console.log('\nDone.\n');
}

main();
