import process from 'node:process';
import { resolve } from 'node:path';
import {
	convertImages,
	createJpegImage,
	ImageConversionBatchError,
	type ImageConversionFailure,
	type ImageConversionRequest,
} from '../src/lib/imageConversion';

const publicDirectory = './public';
const openGraphImage = {
	inputPath: `${publicDirectory}/og-image.webp`,
	outputPath: `${publicDirectory}/og-image.jpg`,
};

const imageGroups: Array<{
	title: string;
	requests: ImageConversionRequest[];
}> = [
	{
		title: 'Converting background images (originals kept as fallback)',
		requests: ['monalisa.png', 'vangogh.png', 'museum.jpeg'].map((image) => ({
			inputPath: `${publicDirectory}/${image}`,
		})),
	},
	{
		title: 'Converting inline images (originals kept as fallback)',
		requests: ['pisa.jpg', 'orange.png', 'webinar4.png'].map((image) => ({
			inputPath: `${publicDirectory}/${image}`,
		})),
	},
];

async function runDefaultConversion(): Promise<void> {
	const failures: ImageConversionFailure[] = [];

	for (const group of imageGroups) {
		console.log(`\n=== ${group.title} ===`);

		try {
			await convertImages(group.requests);
		} catch (error) {
			if (error instanceof ImageConversionBatchError) {
				failures.push(...error.failures);
			} else {
				throw error;
			}
		}
	}

	console.log('\n=== Converting Open Graph share image ===');
	try {
		await createJpegImage(openGraphImage.inputPath, openGraphImage.outputPath);
	} catch (error) {
		if (error instanceof ImageConversionBatchError) {
			failures.push(...error.failures);
		} else {
			throw error;
		}
	}

	if (failures.length > 0) {
		throw new ImageConversionBatchError(failures);
	}
}

async function runCli(): Promise<void> {
	const cliArguments = process.argv.slice(2);

	if (cliArguments.length > 0) {
		await convertImages(cliArguments.map((argument) => ({ inputPath: resolve(argument) })));
	} else {
		await runDefaultConversion();
	}

	console.log('\nDone.\n');
}

try {
	await runCli();
} catch (error) {
	const message = error instanceof Error ? error.message : 'Unknown image conversion error';
	console.error(`\nImage conversion failed: ${message}\n`);
	process.exitCode = 1;
}
