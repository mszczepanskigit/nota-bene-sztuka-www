import sharp from 'sharp';
import { access, mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
	convertImages,
	createJpegImage,
	ImageConversionBatchError,
	type ImageConversionLogger,
} from './imageConversion';

const silentLogger: ImageConversionLogger = {
	log: (): void => undefined,
	error: (): void => undefined,
};

async function fileExists(path: string): Promise<boolean> {
	try {
		await access(path);
		return true;
	} catch {
		return false;
	}
}

async function createPng(path: string): Promise<void> {
	await sharp({
		create: {
			width: 2,
			height: 2,
			channels: 4,
			background: '#ff8000',
		},
	})
		.png()
		.toFile(path);
}

describe('convertImages', () => {
	let temporaryDirectory: string;

	beforeEach(async () => {
		temporaryDirectory = await mkdtemp(join(tmpdir(), 'nbs-image-conversion-'));
	});

	afterEach(async () => {
		await rm(temporaryDirectory, { recursive: true, force: true });
	});

	it('converts an image to WebP and keeps the source by default', async () => {
		const inputPath = join(temporaryDirectory, 'source.png');
		const outputPath = join(temporaryDirectory, 'source.webp');
		await createPng(inputPath);

		await expect(convertImages([{ inputPath }], silentLogger)).resolves.toEqual([outputPath]);
		expect(await fileExists(inputPath)).toBe(true);
		expect(await fileExists(outputPath)).toBe(true);
		expect((await sharp(outputPath).metadata()).format).toBe('webp');
	});

	it('deletes the source only when explicitly requested', async () => {
		const inputPath = join(temporaryDirectory, 'delete-me.png');
		const outputPath = join(temporaryDirectory, 'delete-me.webp');
		await createPng(inputPath);

		await convertImages([{ inputPath, deleteOriginal: true }], silentLogger);

		expect(await fileExists(inputPath)).toBe(false);
		expect(await fileExists(outputPath)).toBe(true);
	});

	it('reports a missing source with its failed operation', async () => {
		const inputPath = join(temporaryDirectory, 'missing.png');

		await expect(convertImages([{ inputPath }], silentLogger)).rejects.toMatchObject({
			failures: [{ inputPath, operation: 'convert' }],
		});
	});

	it('continues a batch after a failure and reports all failures', async () => {
		const firstInput = join(temporaryDirectory, 'first.png');
		const missingInput = join(temporaryDirectory, 'missing.png');
		const lastInput = join(temporaryDirectory, 'last.png');
		await Promise.all([createPng(firstInput), createPng(lastInput)]);

		let error: ImageConversionBatchError | undefined;

		try {
			await convertImages(
				[{ inputPath: firstInput }, { inputPath: missingInput }, { inputPath: lastInput }],
				silentLogger
			);
		} catch (caughtError) {
			if (caughtError instanceof ImageConversionBatchError) {
				error = caughtError;
			}
		}

		expect(error?.failures).toHaveLength(1);
		expect(error?.failures[0]).toMatchObject({
			inputPath: missingInput,
			operation: 'convert',
		});
		expect(await fileExists(join(temporaryDirectory, 'first.webp'))).toBe(true);
		expect(await fileExists(join(temporaryDirectory, 'last.webp'))).toBe(true);
	});

	it('creates a JPEG share image from a WebP source', async () => {
		const pngPath = join(temporaryDirectory, 'source.png');
		const webpPath = join(temporaryDirectory, 'source.webp');
		const jpegPath = join(temporaryDirectory, 'share-image.jpg');
		await createPng(pngPath);
		await sharp(pngPath).webp().toFile(webpPath);

		await createJpegImage(webpPath, jpegPath, silentLogger);

		expect(await fileExists(jpegPath)).toBe(true);
		expect((await sharp(jpegPath).metadata()).format).toBe('jpeg');
	});
});
