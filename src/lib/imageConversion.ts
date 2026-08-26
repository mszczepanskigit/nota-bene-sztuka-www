import sharp from 'sharp';
import { unlink } from 'node:fs/promises';
import { basename } from 'node:path';

export interface ImageConversionRequest {
	inputPath: string;
	deleteOriginal?: boolean;
}

export interface ImageConversionFailure {
	inputPath: string;
	operation: 'convert' | 'delete';
	cause: unknown;
}

export interface ImageConversionLogger {
	log(message: string): void;
	error(message: string): void;
}

export class ImageConversionBatchError extends Error {
	constructor(public readonly failures: ImageConversionFailure[]) {
		super(`${failures.length} image conversion operation(s) failed`);
		this.name = 'ImageConversionBatchError';
	}
}

class ImageConversionOperationError extends Error {
	constructor(public readonly failure: ImageConversionFailure) {
		super(`${failure.operation} failed for ${basename(failure.inputPath)}`, {
			cause: failure.cause,
		});
		this.name = 'ImageConversionOperationError';
	}
}

function getOutputPath(inputPath: string): string {
	const outputPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');

	if (outputPath === inputPath) {
		throw new Error(`Unsupported image extension: ${basename(inputPath)}`);
	}

	return outputPath;
}

async function convertImage(
	request: ImageConversionRequest,
	logger: ImageConversionLogger
): Promise<string> {
	const outputPath = getOutputPath(request.inputPath);

	try {
		await sharp(request.inputPath).webp({ quality: 90, effort: 6 }).toFile(outputPath);
		logger.log(`Converted ${basename(request.inputPath)} to ${basename(outputPath)}`);
	} catch (error) {
		logger.error(`Failed to convert ${basename(request.inputPath)}`);
		throw new ImageConversionOperationError({
			inputPath: request.inputPath,
			operation: 'convert',
			cause: error,
		});
	}

	if (request.deleteOriginal) {
		try {
			await unlink(request.inputPath);
			logger.log(`Deleted original ${basename(request.inputPath)}`);
		} catch (error) {
			logger.error(`Failed to delete ${basename(request.inputPath)}`);
			throw new ImageConversionOperationError({
				inputPath: request.inputPath,
				operation: 'delete',
				cause: error,
			});
		}
	}

	return outputPath;
}

export async function convertImages(
	requests: ImageConversionRequest[],
	logger: ImageConversionLogger = console
): Promise<string[]> {
	const outputPaths: string[] = [];
	const failures: ImageConversionFailure[] = [];

	for (const request of requests) {
		try {
			outputPaths.push(await convertImage(request, logger));
		} catch (error) {
			if (error instanceof ImageConversionOperationError) {
				failures.push(error.failure);
			} else {
				failures.push({
					inputPath: request.inputPath,
					operation: 'convert',
					cause: error,
				});
			}
		}
	}

	if (failures.length > 0) {
		throw new ImageConversionBatchError(failures);
	}

	return outputPaths;
}

export async function createJpegImage(
	inputPath: string,
	outputPath: string,
	logger: ImageConversionLogger = console
): Promise<void> {
	try {
		await sharp(inputPath).jpeg({ quality: 90, mozjpeg: true }).toFile(outputPath);
		logger.log(`Converted ${basename(inputPath)} to ${basename(outputPath)}`);
	} catch (error) {
		logger.error(`Failed to convert ${basename(inputPath)} to JPEG`);
		throw new ImageConversionBatchError([
			{
				inputPath,
				operation: 'convert',
				cause: error,
			},
		]);
	}
}
