import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { PDFDocument } from 'pdf-lib';
import { normalizeExtension } from '../utils/formatRules.js';

const execFileAsync = promisify(execFile);

export interface ConvertOptions {
  inputPath: string;
  outputPath: string;
  sourceFormat: string;
  targetFormat: string;
}

function getPowerShellScriptPath(): string {
  const possiblePaths = [
    path.resolve(process.cwd(), 'src/scripts/convertOffice.ps1'),
    path.resolve(process.cwd(), 'dist/scripts/convertOffice.ps1'),
    path.resolve(typeof __dirname !== 'undefined' ? __dirname : '', '../scripts/convertOffice.ps1'),
  ];
  for (const p of possiblePaths) {
    if (fsSync.existsSync(p)) {
      return p;
    }
  }
  return possiblePaths[0];
}

/**
 * Configure fluent-ffmpeg with the system FFmpeg binary.
 */
async function getFfmpeg() {
  const fluentModule = await import('fluent-ffmpeg');
  const ffmpeg = (fluentModule as any).default || fluentModule;

  // Configure explicit system path (/usr/bin/ffmpeg) if present, or use global PATH
  if (process.env.FFMPEG_PATH) {
    ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
  } else if (fsSync.existsSync('/usr/bin/ffmpeg')) {
    ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');
  }

  if (process.env.FFPROBE_PATH) {
    ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
  } else if (fsSync.existsSync('/usr/bin/ffprobe')) {
    ffmpeg.setFfprobePath('/usr/bin/ffprobe');
  }

  return ffmpeg;
}

/**
 * Office document conversions (Word, Excel, PowerPoint) via PowerShell COM automation.
 */
async function convertWithOfficeCOM(
  inputPath: string,
  outputPath: string,
  sourceFormat: string,
  targetFormat: string,
): Promise<void> {
  const scriptPath = getPowerShellScriptPath();
  const { stdout, stderr } = await execFileAsync(
    'powershell.exe',
    [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      scriptPath,
      '-InputPath',
      inputPath,
      '-OutputPath',
      outputPath,
      '-SourceFormat',
      sourceFormat,
      '-TargetFormat',
      targetFormat,
    ],
    { timeout: 120000 },
  );

  if (!stdout.includes('SUCCESS')) {
    throw new Error(stderr || stdout || 'Office COM conversion failed');
  }
}

/**
 * Fallback to LibreOffice if available on system.
 */
async function convertWithLibreOffice(
  inputPath: string,
  outputPath: string,
  targetFormat: string,
): Promise<void> {
  try {
    const libre = await import('libreoffice-convert');
    const libreConvert = libre.default?.convert || (libre as any).convert;

    if (!libreConvert) {
      throw new Error('LibreOffice convert library could not be loaded');
    }

    const inputBuffer = await fs.readFile(inputPath);
    const convertedBuffer = await new Promise<Buffer>((resolve, reject) => {
      libreConvert(inputBuffer, `.${targetFormat}`, undefined, (err: Error | null, done: Buffer) => {
        if (err) return reject(err);
        resolve(done);
      });
    });

    await fs.writeFile(outputPath, convertedBuffer);
  } catch (error: any) {
    throw new Error('Conversion engine not installed on this server');
  }
}

/**
 * General Office dispatcher with fallback.
 */
async function convertOfficeDocuments(
  inputPath: string,
  outputPath: string,
  sourceFormat: string,
  targetFormat: string,
): Promise<void> {
  if (process.platform === 'win32') {
    try {
      await convertWithOfficeCOM(inputPath, outputPath, sourceFormat, targetFormat);
      return;
    } catch (err: any) {
      console.warn(`[Conversion] MS Office COM conversion warning: ${err.message}. Trying LibreOffice fallback...`);
    }
  }

  await convertWithLibreOffice(inputPath, outputPath, targetFormat);
}

/**
 * Image transformations using Sharp, heic-convert, and pdf-lib.
 * Handles: JPG, JPEG, PNG, WEBP, HEIC, GIF, BMP, TIFF, SVG -> JPG, PNG, WEBP, PDF
 */
async function convertImage(
  inputPath: string,
  outputPath: string,
  sourceFormat: string,
  targetFormat: string,
): Promise<void> {
  const sharpModule = await import('sharp');
  const sharp = (sharpModule as any).default || sharpModule;

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

  // Convert to target image format
  let pipeline = sharp(imageBuffer);
  if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
    pipeline = pipeline.jpeg({ quality: 90 });
  } else if (targetFormat === 'png') {
    pipeline = pipeline.png({ compressionLevel: 8 });
  } else if (targetFormat === 'webp') {
    pipeline = pipeline.webp({ quality: 90 });
  } else if (targetFormat === 'gif') {
    pipeline = pipeline.gif();
  } else if (targetFormat === 'tiff' || targetFormat === 'tif') {
    pipeline = pipeline.tiff();
  } else {
    pipeline = pipeline.toFormat(targetFormat as any);
  }

  await pipeline.toFile(outputPath);
}

/**
 * Audio / Video / Media conversions with FFmpeg.
 */
async function convertMedia(
  inputPath: string,
  outputPath: string,
  sourceFormat: string,
  targetFormat: string,
): Promise<void> {
  const ffmpeg = await getFfmpeg();

  return new Promise<void>((resolve, reject) => {
    let command = ffmpeg(inputPath);

    // Video to Audio: MP4/MOV/AVI/MKV/WEBM -> MP3/WAV
    const isVideoSource = ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(sourceFormat);
    const isAudioTarget = ['mp3', 'wav', 'flac', 'ogg', 'opus', 'm4a', 'aac'].includes(targetFormat);

    if (isVideoSource && isAudioTarget) {
      command = command.noVideo();
    }

    // Video / Frame snapshot extraction: Video -> JPG/PNG
    if (isVideoSource && (targetFormat === 'jpg' || targetFormat === 'jpeg' || targetFormat === 'png')) {
      command
        .seekInput('00:00:01')
        .frames(1)
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(new Error(`Frame extraction failed: ${err.message}`)))
        .run();
      return;
    }

    // Video to GIF: MP4 -> GIF
    if (sourceFormat === 'mp4' && targetFormat === 'gif') {
      command
        .fps(12)
        .complexFilter(['scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse'])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(new Error(`GIF creation failed: ${err.message}`)))
        .run();
      return;
    }

    // GIF to Video: GIF -> MP4
    if (sourceFormat === 'gif' && targetFormat === 'mp4') {
      command
        .videoCodec('libx264')
        .outputOptions([
          '-movflags faststart',
          '-pix_fmt yuv420p',
          '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2',
        ])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err: Error) => reject(new Error(`MP4 from GIF failed: ${err.message}`)))
        .run();
      return;
    }

    // Audio target codecs
    if (targetFormat === 'mp3') {
      command = command.audioCodec('libmp3lame').audioBitrate('192k');
    } else if (targetFormat === 'wav') {
      command = command.audioCodec('pcm_s16le');
    } else if (targetFormat === 'flac') {
      command = command.audioCodec('flac');
    } else if (targetFormat === 'ogg' || targetFormat === 'opus') {
      command = command.audioCodec('libvorbis');
    } else if (targetFormat === 'm4a' || targetFormat === 'aac') {
      command = command.audioCodec('aac').audioBitrate('192k');
    }

    // Video target codecs
    if (targetFormat === 'mp4') {
      command = command.videoCodec('libx264').audioCodec('aac').outputOptions(['-pix_fmt yuv420p']);
    } else if (targetFormat === 'webm') {
      command = command.videoCodec('libvpx-vp9').audioCodec('libopus');
    } else if (targetFormat === 'mov') {
      command = command.videoCodec('libx264').audioCodec('aac');
    }

    command
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err: Error) => reject(new Error(`Media conversion failed: ${err.message}`)))
      .run();
  });
}

/**
 * Spreadsheet & Structured Data conversions.
 * Handles: XLSX, XLS, CSV, TSV, JSON, XML -> XLSX, CSV, TSV, JSON, XML, PDF
 */
async function convertSpreadsheetAndData(
  inputPath: string,
  outputPath: string,
  sourceFormat: string,
  targetFormat: string,
): Promise<void> {
  const ExcelJSModule = await import('exceljs');
  const ExcelJS = (ExcelJSModule as any).default || ExcelJSModule;
  const { XMLParser } = await import('fast-xml-parser');

  // If source is XLS or ODS and target is PDF/XLSX/CSV, use Office COM / Excel
  if ((sourceFormat === 'xls' || sourceFormat === 'ods') && ['xlsx', 'csv', 'pdf'].includes(targetFormat)) {
    return convertOfficeDocuments(inputPath, outputPath, sourceFormat, targetFormat);
  }

  // 1. JSON -> CSV or XLSX
  if (sourceFormat === 'json') {
    const jsonRaw = await fs.readFile(inputPath, 'utf-8');
    let data: any;
    try {
      data = JSON.parse(jsonRaw);
    } catch {
      throw new Error('Invalid JSON input file');
    }

    const items: Record<string, any>[] = Array.isArray(data) ? data : (data.items || data.data || [data]);
    const headers = Array.from(new Set(items.flatMap((item) => (typeof item === 'object' && item !== null ? Object.keys(item) : ['value']))));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    worksheet.columns = headers.map((h) => ({ header: h, key: h, width: 20 }));

    for (const item of items) {
      if (typeof item === 'object' && item !== null) {
        worksheet.addRow(item);
      } else {
        worksheet.addRow({ value: item });
      }
    }

    if (targetFormat === 'csv') {
      await workbook.csv.writeFile(outputPath);
    } else {
      await workbook.xlsx.writeFile(outputPath);
    }
    return;
  }

  // 2. XML -> CSV or XLSX
  if (sourceFormat === 'xml') {
    const xmlRaw = await fs.readFile(inputPath, 'utf-8');
    const parser = new XMLParser();
    const parsed = parser.parse(xmlRaw);

    let records: any[] = [];
    const findArray = (obj: any): any[] | null => {
      if (!obj || typeof obj !== 'object') return null;
      for (const key of Object.keys(obj)) {
        if (Array.isArray(obj[key])) return obj[key];
        if (typeof obj[key] === 'object') {
          const res = findArray(obj[key]);
          if (res) return res;
        }
      }
      return null;
    };

    records = findArray(parsed) || [parsed];
    const headers = Array.from(new Set(records.flatMap((r) => (typeof r === 'object' && r !== null ? Object.keys(r) : ['value']))));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    worksheet.columns = headers.map((h) => ({ header: h, key: h, width: 20 }));

    for (const r of records) {
      if (typeof r === 'object' && r !== null) {
        worksheet.addRow(r);
      } else {
        worksheet.addRow({ value: r });
      }
    }

    if (targetFormat === 'csv') {
      await workbook.csv.writeFile(outputPath);
    } else {
      await workbook.xlsx.writeFile(outputPath);
    }
    return;
  }

  // 3. TSV -> CSV or XLSX
  if (sourceFormat === 'tsv') {
    const raw = await fs.readFile(inputPath, 'utf-8');
    const rows = raw.split(/\r?\n/).map((line) => line.split('\t'));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    rows.forEach((row) => worksheet.addRow(row));

    if (targetFormat === 'csv') {
      await workbook.csv.writeFile(outputPath);
    } else {
      await workbook.xlsx.writeFile(outputPath);
    }
    return;
  }

  // 4. XLSX or CSV -> CSV, XLSX, TSV, JSON, XML, PDF
  const workbook = new ExcelJS.Workbook();
  if (sourceFormat === 'csv') {
    await workbook.csv.readFile(inputPath);
  } else {
    await workbook.xlsx.readFile(inputPath);
  }

  const worksheet = workbook.worksheets[0] || workbook.addWorksheet('Sheet1');

  if (targetFormat === 'pdf') {
    // If Excel COM is available, use Excel to generate beautiful PDF
    if (sourceFormat === 'csv') {
      // Save temporary xlsx first
      const tempXlsx = path.join(os.tmpdir(), `temp-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.xlsx`);
      try {
        await workbook.xlsx.writeFile(tempXlsx);
        await convertOfficeDocuments(tempXlsx, outputPath, 'xlsx', 'pdf');
      } finally {
        await fs.unlink(tempXlsx).catch(() => {});
      }
      return;
    }
    return convertOfficeDocuments(inputPath, outputPath, 'xlsx', 'pdf');
  }

  if (targetFormat === 'xlsx') {
    await workbook.xlsx.writeFile(outputPath);
    return;
  }

  if (targetFormat === 'csv') {
    await workbook.csv.writeFile(outputPath);
    return;
  }

  if (targetFormat === 'tsv') {
    const lines: string[] = [];
    worksheet.eachRow((row: any) => {
      const values = Array.isArray(row.values) ? row.values.slice(1) : [];
      lines.push(values.map((v: any) => (v === null || v === undefined ? '' : String(v))).join('\t'));
    });
    await fs.writeFile(outputPath, lines.join('\n'), 'utf-8');
    return;
  }

  if (targetFormat === 'json') {
    const rows: Record<string, any>[] = [];
    let headers: string[] = [];

    worksheet.eachRow((row: any, rowNumber: number) => {
      const values = Array.isArray(row.values) ? row.values.slice(1) : [];
      if (rowNumber === 1) {
        headers = values.map((v: any, i: number) => (v ? String(v) : `col_${i + 1}`));
      } else {
        const item: Record<string, any> = {};
        headers.forEach((h, i) => {
          item[h] = values[i] !== undefined ? values[i] : null;
        });
        rows.push(item);
      }
    });

    await fs.writeFile(outputPath, JSON.stringify(rows, null, 2), 'utf-8');
    return;
  }

  if (targetFormat === 'xml') {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<spreadsheet>\n';
    let headers: string[] = [];

    worksheet.eachRow((row: any, rowNumber: number) => {
      const values = Array.isArray(row.values) ? row.values.slice(1) : [];
      if (rowNumber === 1) {
        headers = values.map((v: any, i: number) => (v ? String(v).replace(/[^a-zA-Z0-9_]/g, '_') : `col_${i + 1}`));
      } else {
        xml += '  <row>\n';
        headers.forEach((h, i) => {
          const val = values[i] !== undefined && values[i] !== null ? String(values[i]) : '';
          const escaped = val
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          xml += `    <${h}>${escaped}</${h}>\n`;
        });
        xml += '  </row>\n';
      }
    });
    xml += '</spreadsheet>\n';
    await fs.writeFile(outputPath, xml, 'utf-8');
    return;
  }

  throw new Error(`Unsupported spreadsheet conversion: ${sourceFormat} to ${targetFormat}`);
}

/**
 * Text, Markdown, EPUB, and specialized document conversions.
 */
async function convertSpecializedDocuments(
  inputPath: string,
  outputPath: string,
  sourceFormat: string,
  targetFormat: string,
): Promise<void> {
  // 1. TXT -> MP3 (via Windows SpeechSynthesizer -> WAV -> FFmpeg -> MP3)
  if (sourceFormat === 'txt' && targetFormat === 'mp3') {
    const tempWav = path.join(os.tmpdir(), `tts-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.wav`);
    try {
      await convertWithOfficeCOM(inputPath, tempWav, 'txt', 'wav');
      await convertMedia(tempWav, outputPath, 'wav', 'mp3');
    } finally {
      await fs.unlink(tempWav).catch(() => {});
    }
    return;
  }

  // 2. TXT -> MD, HTML
  if (sourceFormat === 'txt') {
    const textContent = await fs.readFile(inputPath, 'utf-8');
    if (targetFormat === 'md') {
      const mdContent = `# Documento\n\n${textContent}`;
      await fs.writeFile(outputPath, mdContent, 'utf-8');
      return;
    }
    if (targetFormat === 'html') {
      const escaped = textContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title><style>body{font-family:sans-serif;line-height:1.6;padding:2rem;max-width:800px;margin:auto;white-space:pre-wrap;}</style></head><body>${escaped}</body></html>`;
      await fs.writeFile(outputPath, html, 'utf-8');
      return;
    }
  }

  // 3. Markdown (MD) -> HTML, DOCX, PDF
  if (sourceFormat === 'md') {
    const mdRaw = await fs.readFile(inputPath, 'utf-8');
    const markedModule = await import('marked');
    const marked = (markedModule as any).marked || (markedModule as any).default || markedModule;
    const bodyHtml = marked.parse(mdRaw);
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title><style>body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;line-height:1.6;padding:2.5rem;max-width:850px;margin:auto;color:#222;}h1,h2,h3{color:#111;}table{border-collapse:collapse;width:100%;margin:1rem 0;}th,td{border:1px solid #ddd;padding:8px;}pre{background:#f4f4f5;padding:12px;border-radius:6px;overflow-x:auto;}</style></head><body>${bodyHtml}</body></html>`;

    if (targetFormat === 'html') {
      await fs.writeFile(outputPath, fullHtml, 'utf-8');
      return;
    }

    // MD -> DOCX or PDF via HTML -> Office COM
    const tempHtml = path.join(os.tmpdir(), `md-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.html`);
    try {
      await fs.writeFile(tempHtml, fullHtml, 'utf-8');
      await convertOfficeDocuments(tempHtml, outputPath, 'html', targetFormat);
    } finally {
      await fs.unlink(tempHtml).catch(() => {});
    }
    return;
  }

  // 4. HTML or DOCX -> MD (using turndown)
  if (targetFormat === 'md' && (sourceFormat === 'html' || sourceFormat === 'htm' || sourceFormat === 'docx')) {
    let htmlContent = '';
    if (sourceFormat === 'docx') {
      const tempHtml = path.join(os.tmpdir(), `docx-html-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.html`);
      try {
        await convertOfficeDocuments(inputPath, tempHtml, 'docx', 'html');
        htmlContent = await fs.readFile(tempHtml, 'utf-8');
      } finally {
        await fs.unlink(tempHtml).catch(() => {});
      }
    } else {
      htmlContent = await fs.readFile(inputPath, 'utf-8');
    }

    const TurndownModule = await import('turndown');
    const TurndownService = (TurndownModule as any).default || TurndownModule;
    const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    const markdown = turndownService.turndown(htmlContent);
    await fs.writeFile(outputPath, markdown, 'utf-8');
    return;
  }

  // 5. EPUB -> PDF or DOCX (extract HTML chapters, concatenate, convert via Office)
  if (sourceFormat === 'epub') {
    const AdmZipModule = await import('adm-zip');
    const AdmZip = (AdmZipModule as any).default || AdmZipModule;
    const zip = new AdmZip(inputPath);
    const zipEntries = zip.getEntries();

    let combinedHtml = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:sans-serif;line-height:1.6;padding:2rem;max-width:800px;margin:auto;}</style></head><body>';
    const htmlEntries = zipEntries
      .filter((e: any) => /\.(html|xhtml|htm)$/i.test(e.entryName) && !e.isDirectory)
      .sort((a: any, b: any) => a.entryName.localeCompare(b.entryName));

    for (const entry of htmlEntries) {
      const content = entry.getData().toString('utf-8');
      const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      combinedHtml += bodyMatch ? `<div class="chapter">${bodyMatch[1]}</div><div style="page-break-after:always;"></div>` : content;
    }
    combinedHtml += '</body></html>';

    const tempHtml = path.join(os.tmpdir(), `epub-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.html`);
    try {
      await fs.writeFile(tempHtml, combinedHtml, 'utf-8');
      await convertOfficeDocuments(tempHtml, outputPath, 'html', targetFormat);
    } finally {
      await fs.unlink(tempHtml).catch(() => {});
    }
    return;
  }

  // 6. PDF -> TXT, XLSX, CSV (extract text / tables)
  if (sourceFormat === 'pdf' && ['txt', 'xlsx', 'csv'].includes(targetFormat)) {
    // Try Word COM first for PDF -> TXT if available
    if (targetFormat === 'txt') {
      try {
        await convertOfficeDocuments(inputPath, outputPath, 'pdf', 'txt');
        return;
      } catch {
        // Fallback to pdf-parse
      }
    }

    const pdfBuffer = await fs.readFile(inputPath);
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = (pdfParseModule as any).default || pdfParseModule;
    const data = await pdfParse(pdfBuffer);
    const text = data.text || '';

    if (targetFormat === 'txt') {
      await fs.writeFile(outputPath, text, 'utf-8');
      return;
    }

    // PDF -> XLSX or CSV (detect table rows/columns from lines)
    const lines = text.split(/\r?\n/).filter((l: string) => l.trim().length > 0);
    const rows = lines.map((line: string) => {
      // Split on tabs or 2+ consecutive spaces or commas
      return line.split(/\t|\s{2,}|,/g).map((c: string) => c.trim()).filter((c: string) => c.length > 0);
    });

    const ExcelJSModule = await import('exceljs');
    const ExcelJS = (ExcelJSModule as any).default || ExcelJSModule;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Extracted Table');

    rows.forEach((r: string[]) => {
      if (r.length > 0) worksheet.addRow(r);
    });

    if (targetFormat === 'csv') {
      await workbook.csv.writeFile(outputPath);
    } else {
      await workbook.xlsx.writeFile(outputPath);
    }
    return;
  }

  // 7. PDF -> JPG or PNG
  if (sourceFormat === 'pdf' && (targetFormat === 'jpg' || targetFormat === 'jpeg' || targetFormat === 'png')) {
    try {
      const pdfPopplerModule = await import('pdf-poppler');
      const pdfPoppler = (pdfPopplerModule as any).default || pdfPopplerModule;
      const outDir = path.dirname(outputPath);
      const outPrefix = path.basename(outputPath, `.${targetFormat}`);

      await pdfPoppler.convert(inputPath, {
        format: targetFormat === 'jpg' ? 'jpeg' : targetFormat,
        out_dir: outDir,
        out_prefix: outPrefix,
        page: 1,
      });

      const expected = path.join(outDir, `${outPrefix}-1.${targetFormat === 'jpg' ? 'jpg' : targetFormat}`);
      try {
        await fs.access(expected);
        await fs.rename(expected, outputPath);
      } catch {
        await fs.access(outputPath);
      }
      return;
    } catch {
      throw new Error('Conversion engine not installed on this server');
    }
  }

  throw new Error(`Unsupported specialized document conversion: ${sourceFormat} to ${targetFormat}`);
}

/**
 * Master dispatcher for all supported conversions.
 */
export async function convertFile(options: ConvertOptions): Promise<void> {
  const source = normalizeExtension(options.sourceFormat);
  const target = normalizeExtension(options.targetFormat);

  const imageFormats = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'gif', 'bmp', 'tiff', 'tif', 'svg'];
  const mediaFormats = ['wav', 'mp3', 'flac', 'm4a', 'aac', 'ogg', 'opus', 'mp4', 'mov', 'avi', 'mkv', 'webm'];
  const dataFormats = ['xlsx', 'xls', 'csv', 'tsv', 'ods', 'json', 'xml'];

  // 1. GIF <-> MP4
  if ((source === 'gif' && target === 'mp4') || (source === 'mp4' && target === 'gif')) {
    return convertMedia(options.inputPath, options.outputPath, source, target);
  }

  // 2. Video to frame extraction (Video -> JPG/PNG)
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(source) && ['jpg', 'jpeg', 'png'].includes(target)) {
    return convertMedia(options.inputPath, options.outputPath, source, target);
  }

  // 3. Audio & Video media transcoding (including Video -> Audio extraction)
  if (mediaFormats.includes(source) && mediaFormats.includes(target)) {
    return convertMedia(options.inputPath, options.outputPath, source, target);
  }

  // 4. Image conversions (Sharp, heic-convert, pdf-lib)
  if (imageFormats.includes(source) && (imageFormats.includes(target) || target === 'pdf')) {
    return convertImage(options.inputPath, options.outputPath, source, target);
  }

  // 5. Spreadsheet and structured data
  if (dataFormats.includes(source) && (dataFormats.includes(target) || target === 'pdf')) {
    return convertSpreadsheetAndData(options.inputPath, options.outputPath, source, target);
  }

  // 6. TXT to MP3
  if (source === 'txt' && target === 'mp3') {
    return convertSpecializedDocuments(options.inputPath, options.outputPath, source, target);
  }

  // 7. Markdown, HTML -> MD, EPUB, PDF -> TXT/XLSX/CSV/JPG/PNG
  if (
    source === 'md' ||
    target === 'md' ||
    source === 'epub' ||
    (source === 'pdf' && ['txt', 'xlsx', 'csv', 'jpg', 'jpeg', 'png'].includes(target)) ||
    (source === 'txt' && ['html', 'md'].includes(target))
  ) {
    return convertSpecializedDocuments(options.inputPath, options.outputPath, source, target);
  }

  // 8. Office documents (Word, Excel, PowerPoint -> PDF, PDF/A, DOCX, TXT, HTML, RTF, ODT, JPG, PNG, MP4)
  const officeSources = ['docx', 'doc', 'rtf', 'odt', 'html', 'htm', 'txt', 'pdf', 'pdfa', 'pptx', 'ppt', 'odp', 'xlsx', 'xls', 'ods'];
  if (officeSources.includes(source)) {
    return convertOfficeDocuments(options.inputPath, options.outputPath, source, target);
  }

  throw new Error(`Unsupported conversion route from '${source}' to '${target}'`);
}
