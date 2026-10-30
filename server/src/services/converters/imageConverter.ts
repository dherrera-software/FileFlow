import fs from 'fs/promises';
import { PDFDocument } from 'pdf-lib';

let _sharpInstance: any = null;

async function getSharp() {
  if (!_sharpInstance) {
    const mod = await import('sharp');
    _sharpInstance = (mod as any).default || mod;
  }
  return _sharpInstance;
}

export async function convertImage(
  inputPath: string,
  outputPath: string,
  sourceFormat: string,
  targetFormat: string,
): Promise<void> {
  const sharp = await getSharp();

  let imageBuffer: Buffer;

  if (sourceFormat === 'heic') {
    const heicConvertModule = await import('heic-convert');
    const heicConvert = (heicConvertModule as any).default || heicConvertModule;
    const rawBytes = await fs.readFile(inputPath);
    const jpegBytes = await heicConvert({
      buffer: rawBytes,
      format: 'JPEG',
      quality: 0.95,
    });
    imageBuffer = Buffer.from(jpegBytes);
  } else {
    imageBuffer = await fs.readFile(inputPath);
  }

  // If target is PDF, render to PNG/JPEG with Sharp, then embed into pdf-lib
  if (targetFormat === 'pdf') {
    const pngBuffer = await sharp(imageBuffer).png().toBuffer();
    const pdfDoc = await PDFDocument.create();
    const image = await pdfDoc.embedPng(pngBuffer);
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    return;
  }

  // Convert to target image format with streaming pipeline
  let pipeline = sharp(imageBuffer);
  if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
    pipeline = pipeline.jpeg({ quality: 90, mozjpeg: true });
  } else if (targetFormat === 'png') {
    pipeline = pipeline.png({ compressionLevel: 6, adaptiveFiltering: true });
  } else if (targetFormat === 'webp') {
    pipeline = pipeline.webp({ quality: 90, effort: 4 });
  } else if (targetFormat === 'gif') {
    pipeline = pipeline.gif();
  } else if (targetFormat === 'tiff' || targetFormat === 'tif') {
    pipeline = pipeline.tiff();
  } else {
    pipeline = pipeline.toFormat(targetFormat as any);
  }

  await pipeline.toFile(outputPath);
}

