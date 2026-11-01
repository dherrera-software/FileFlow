import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { convertOfficeDocuments, convertWithOfficeCOM } from './officeConverter.js';
import { convertMedia } from './mediaConverter.js';

let _excelJSInstance: any = null;

async function getExcelJS() {
  if (!_excelJSInstance) {
    const mod = await import('exceljs');
    _excelJSInstance = (mod as any).default || mod;
  }
  return _excelJSInstance;
}

async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  const pdfParseModule = await import('pdf-parse');
  // 1. pdf-parse v1 (function or default function export)
  if (typeof (pdfParseModule as any).default === 'function') {
    const data = await (pdfParseModule as any).default(pdfBuffer);
    return data.text || '';
  }
  if (typeof pdfParseModule === 'function') {
    const data = await (pdfParseModule as any)(pdfBuffer);
    return data.text || '';
  }
  // 2. pdf-parse v2+ (PDFParse class)
  const PDFParseClass = (pdfParseModule as any).PDFParse || (pdfParseModule.default as any)?.PDFParse;
  if (PDFParseClass) {
    const parser = new PDFParseClass({ data: pdfBuffer });
    try {
      const res = await parser.getText();
      return res?.text || '';
    } finally {
      await parser.destroy().catch(() => {});
    }
  }
  throw new Error('No compatible PDF parser found in pdf-parse library');
}

export async function convertSpecializedDocuments(
  inputPath: string,
  outputPath: string,
  sourceFormat: string,
  targetFormat: string,
): Promise<void> {
  // 1. TXT -> MP3 (TTS via Windows SpeechSynthesizer -> WAV -> FFmpeg -> MP3)
  if (sourceFormat === 'txt' && targetFormat === 'mp3') {
    if (process.platform === 'win32') {
      const tempWav = path.join(os.tmpdir(), `tts-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.wav`);
      try {
        await convertWithOfficeCOM(inputPath, tempWav, 'txt', 'wav');
        await convertMedia(tempWav, outputPath, 'wav', 'mp3');
        return;
      } finally {
        fs.unlink(tempWav).catch(() => {});
      }
    }
    throw new Error('La conversión de TXT a MP3 (TTS) requiere entorno Windows con SpeechSynthesizer.');
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

    const tempHtml = path.join(os.tmpdir(), `md-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.html`);
    try {
      await fs.writeFile(tempHtml, fullHtml, 'utf-8');
      await convertOfficeDocuments(tempHtml, outputPath, 'html', targetFormat);
    } finally {
      fs.unlink(tempHtml).catch(() => {});
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
        fs.unlink(tempHtml).catch(() => {});
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

  // 5. EPUB -> PDF or DOCX
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
      fs.unlink(tempHtml).catch(() => {});
    }
    return;
  }

  // 6. PDF -> TXT, XLSX, CSV
  if (sourceFormat === 'pdf' && ['txt', 'xlsx', 'csv'].includes(targetFormat)) {
    if (targetFormat === 'txt') {
      try {
        await convertOfficeDocuments(inputPath, outputPath, 'pdf', 'txt');
        return;
      } catch {
        // Fallback to pdf-parse
      }
    }

    const pdfBuffer = await fs.readFile(inputPath);
    const text = await extractTextFromPdf(pdfBuffer);

    if (targetFormat === 'txt') {
      await fs.writeFile(outputPath, text, 'utf-8');
      return;
    }

    const lines = text.split(/\r?\n/).filter((l: string) => l.trim().length > 0);
    const rows = lines.map((line: string) => {
      return line.split(/\t|\s{2,}|,/g).map((c: string) => c.trim()).filter((c: string) => c.length > 0);
    });

    const ExcelJS = await getExcelJS();
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
    // 1. Intentar renderizado de primera página vía PDFParse (@napi-rs/canvas)
    try {
      const pdfBuffer = await fs.readFile(inputPath);
      const pdfParseModule = await import('pdf-parse');
      const PDFParseClass = (pdfParseModule as any).PDFParse || (pdfParseModule.default as any)?.PDFParse;

      if (PDFParseClass) {
        const parser = new PDFParseClass({ data: pdfBuffer });
        try {
          const screenshot = await parser.getScreenshot({ page: 1 });
          if (screenshot?.pages?.[0]?.data) {
            const pageBuffer = Buffer.from(screenshot.pages[0].data);
            if (targetFormat === 'png') {
              await fs.writeFile(outputPath, pageBuffer);
              return;
            }
            const sharpModule = await import('sharp');
            const sharp = (sharpModule as any).default || sharpModule;
            await sharp(pageBuffer).jpeg({ quality: 90 }).toFile(outputPath);
            return;
          }
        } finally {
          await parser.destroy().catch(() => {});
        }
      }
    } catch (e: any) {
      console.warn(`[SpecializedConverter] PDF to image via canvas fallback: ${e.message}`);
    }

    // 2. Fallback a pdf-poppler si está disponible en el sistema
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
      throw new Error('No se pudo convertir PDF a imagen. Instala poppler o verifica el documento.');
    }
  }

  throw new Error(`Unsupported specialized document conversion: ${sourceFormat} to ${targetFormat}`);
}

