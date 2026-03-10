/**
 * Macht weiße und fast-weiße Pixel im Logo transparent.
 * Ausgabe: website/logo-transparent.png
 */
const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, 'website', 'Modern Logo with Bold Color Contrast.png');
const outputPath = path.join(__dirname, 'website', 'logo-transparent.png');

// Schwellwert: R, G, B >= THRESHOLD → Pixel wird transparent (z.B. 250 = fast weiß)
const WHITE_THRESHOLD = 250;

async function main() {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const pixels = new Uint8Array(data);

  for (let i = 0; i < pixels.length; i += channels) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    if (r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD) {
      pixels[i + 3] = 0; // Alpha = 0 (transparent)
    }
  }

  await sharp(pixels, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(outputPath);

  console.log('Logo mit transparentem Hintergrund gespeichert:', outputPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
