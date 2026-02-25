import sharp from 'sharp';

const publicDir = './public';

// Background images that need WebP conversion
const backgroundImages: string[] = [
  'monalisa.png',
  'vangogh.png',
  'museum.jpeg'
];

async function convertToWebP(): Promise<void> {
  console.log('Converting background images to WebP format...\n');

  for (const image of backgroundImages) {
    const inputPath = `${publicDir}/${image}`;
    const outputPath = `${publicDir}/${image.replace(/\.(png|jpg|jpeg)$/, '.webp')}`;

    try {
      await sharp(inputPath)
        .webp({ quality: 90, effort: 6 })
        .toFile(outputPath);

      const outputFilename = outputPath.split('/').pop();
      console.log(`SUCCESS: ${image} -> ${outputFilename}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`ERROR: Failed to convert ${image}: ${errorMessage}`);
    }
  }

  console.log('\nConversion complete.');
}

convertToWebP();


