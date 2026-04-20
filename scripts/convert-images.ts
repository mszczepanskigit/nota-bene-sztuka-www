import sharp from 'sharp';
import { unlink } from 'node:fs/promises';
import { resolve, dirname, basename } from 'node:path';

const publicDir = './public';

// Background images (CSS url references) – keep originals as @supports fallback
const backgroundImages: string[] = ['monalisa.png', 'vangogh.png', 'museum.jpeg'];

// Inline images (used via <Image> component) – originals kept as fallback, webp used as primary
const inlineImages: string[] = ['pisa.jpg', 'orange.png', 'webinar2.png'];

// Obsolete images – convert to webp and DELETE the original (will never be used directly)
const obsoleteImages: string[] = ['obsolete/webinar1.png'];

async function convertFile(inputPath: string, deleteOriginal = false): Promise<void> {
	const outputPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
	try {
		await sharp(inputPath).webp({ quality: 90, effort: 6 }).toFile(outputPath);
		console.log(`  ✓  ${basename(inputPath)} → ${basename(outputPath)}`);
		if (deleteOriginal) {
			await unlink(inputPath);
			console.log(`  🗑  Deleted original: ${basename(inputPath)}`);
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		console.error(`  ✗  Failed to convert ${basename(inputPath)}: ${errorMessage}`);
	}
}

async function convertToWebP(images: string[], deleteOriginal = false): Promise<void> {
	for (const image of images) {
		await convertFile(`${publicDir}/${image}`, deleteOriginal);
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

const cliArgs = process.argv.slice(2);

if (cliArgs.length > 0) {
	// CLI mode: convert the given file paths
	(async () => {
		for (const arg of cliArgs) {
			await convertFile(resolve(arg));
		}
		console.log('\nDone.\n');
	})();
} else {
	main();
}
