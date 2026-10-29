import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { marked } from 'marked';
import { MIME_TYPE_MAP, normalizeExtension } from '../utils/formatRules.js';

export interface WorkerConvertOptions {
  fileBytes: Uint8Array;
  fileName: string;
  sourceFormat: string;
  targetFormat: string;
}

export interface WorkerConvertResult {
  data: Uint8Array | string;
  mimeType: string;
  downloadFileName: string;
}

/**
 * Parses simple CSV / TSV text into an array of objects.
 */
function parseDelimitedText(text: string, delimiter: string): Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  // Parse header
  const headers = splitLine(lines[0], delimiter);
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitLine(lines[i], delimiter);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] !== undefined ? values[idx] : '';
    });
    records.push(row);
  }

  return records;
}

function splitLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Formats an array of objects into CSV or TSV string with RFC 4180 escaping.
 */
function formatDelimitedText(records: Record<string, any>[], delimiter: string): string {
  if (records.length === 0) return '';

  const headers = Array.from(
    new Set(records.flatMap((r) => (typeof r === 'object' && r !== null ? Object.keys(r) : ['value']))),
  );

  const escapeField = (val: any): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerRow = headers.map(escapeField).join(delimiter);
  const rows = records.map((record) => {
    return headers
      .map((h) => {
        const val = typeof record === 'object' && record !== null ? record[h] : record;
        return escapeField(val);
      })
      .join(delimiter);
  });

  return [headerRow, ...rows].join('\n');
}

/**
 * Clean self-contained HTML to Markdown converter (zero external DOM dependencies).
 */
function htmlToMarkdown(html: string): string {
  let md = html;
  // Remove script and style tags
  md = md.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  md = md.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n');
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '\n##### $1\n');
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '\n###### $1\n');

  // Bold & Italic
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');

  // Links
  md = md.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Code blocks & inline code
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n');
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

  // Paragraphs and breaks
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');
  md = md.replace(/<br\s*[\/]?>/gi, '\n');

  // Lists
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<\/?(ul|ol)[^>]*>/gi, '\n');

  // Strip remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  md = md
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Clean extra blank lines
  return md.replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Formats plain text into a PDF using pdf-lib.
 */
async function textToPdf(text: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 10;
  const lineHeight = 14;
  const margin = 50;
  const pageWidth = 595.28; // A4
  const pageHeight = 841.89; // A4
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;
  const linesPerPage = Math.floor(usableHeight / lineHeight);

  // Simple word wrapping
  const rawLines = text.split(/\r?\n/);
  const wrappedLines: string[] = [];

  for (const rawLine of rawLines) {
    if (rawLine.trim().length === 0) {
      wrappedLines.push('');
      continue;
    }

    const words = rawLine.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (textWidth <= usableWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) wrappedLines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) wrappedLines.push(currentLine);
  }

  const totalPages = Math.max(1, Math.ceil(wrappedLines.length / linesPerPage));

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const pageLines = wrappedLines.slice(pageIdx * linesPerPage, (pageIdx + 1) * linesPerPage);

    let y = pageHeight - margin - fontSize;
    for (const line of pageLines) {
      if (line.length > 0) {
        page.drawText(line, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0.1, 0.1, 0.1),
        });
      }
      y -= lineHeight;
    }
  }

  return await pdfDoc.save();
}

/**
 * Embeds JPG or PNG image into a PDF page matching the image dimensions.
 */
async function imageToPdf(fileBytes: Uint8Array, sourceFormat: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let image;

  if (sourceFormat === 'jpg' || sourceFormat === 'jpeg') {
    image = await pdfDoc.embedJpg(fileBytes);
  } else if (sourceFormat === 'png') {
    image = await pdfDoc.embedPng(fileBytes);
  } else {
    throw new Error(`Direct PDF embedding not supported for format: ${sourceFormat}`);
  }

  const page = pdfDoc.addPage([image.width, image.height]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  });

  return await pdfDoc.save();
}

/**
 * Master conversion handler for Cloudflare Workers.
 */
export async function convertInWorker(options: WorkerConvertOptions): Promise<WorkerConvertResult> {
  const source = normalizeExtension(options.sourceFormat);
  const target = normalizeExtension(options.targetFormat);
  const textDecoder = new TextDecoder('utf-8');

  const baseName = options.fileName.includes('.')
    ? options.fileName.slice(0, options.fileName.lastIndexOf('.'))
    : options.fileName;
  const downloadFileName = `${baseName}.${target}`;
  const mimeType = MIME_TYPE_MAP[target] || 'application/octet-stream';

  // 1. JSON -> CSV or TSV
  if (source === 'json' && (target === 'csv' || target === 'tsv')) {
    const jsonStr = textDecoder.decode(options.fileBytes);
    const parsed = JSON.parse(jsonStr);
    const items: Record<string, any>[] = Array.isArray(parsed)
      ? parsed
      : parsed?.items || parsed?.data || [parsed];
    const delimiter = target === 'tsv' ? '\t' : ',';
    const csvContent = formatDelimitedText(items, delimiter);
    return { data: csvContent, mimeType, downloadFileName };
  }

  // 2. CSV / TSV -> JSON
  if ((source === 'csv' || source === 'tsv') && target === 'json') {
    const rawText = textDecoder.decode(options.fileBytes);
    const delimiter = source === 'tsv' ? '\t' : ',';
    const records = parseDelimitedText(rawText, delimiter);
    return { data: JSON.stringify(records, null, 2), mimeType, downloadFileName };
  }

  // 3. CSV <-> TSV
  if ((source === 'csv' && target === 'tsv') || (source === 'tsv' && target === 'csv')) {
    const rawText = textDecoder.decode(options.fileBytes);
    const srcDelimiter = source === 'tsv' ? '\t' : ',';
    const targetDelimiter = target === 'tsv' ? '\t' : ',';
    const records = parseDelimitedText(rawText, srcDelimiter);
    const output = formatDelimitedText(records, targetDelimiter);
    return { data: output, mimeType, downloadFileName };
  }

  // 4. XML -> JSON or CSV
  if (source === 'xml' && (target === 'json' || target === 'csv')) {
    const xmlText = textDecoder.decode(options.fileBytes);
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xmlText);

    if (target === 'json') {
      return { data: JSON.stringify(parsed, null, 2), mimeType, downloadFileName };
    }

    // XML -> CSV
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
    const records = findArray(parsed) || [parsed];
    const csvOutput = formatDelimitedText(records, ',');
    return { data: csvOutput, mimeType, downloadFileName };
  }

  // 5. JSON / CSV -> XML
  if ((source === 'json' || source === 'csv') && target === 'xml') {
    let dataObj: any;
    if (source === 'json') {
      dataObj = JSON.parse(textDecoder.decode(options.fileBytes));
    } else {
      const records = parseDelimitedText(textDecoder.decode(options.fileBytes), ',');
      dataObj = { records: { row: records } };
    }

    const builder = new XMLBuilder({ format: true, ignoreAttributes: false });
    const xmlContent = builder.build(typeof dataObj === 'object' ? dataObj : { root: dataObj });
    const finalXml = `<?xml version="1.0" encoding="UTF-8"?>\n${xmlContent}`;
    return { data: finalXml, mimeType, downloadFileName };
  }

  // 6. Markdown (MD) -> HTML
  if (source === 'md' && target === 'html') {
    const mdText = textDecoder.decode(options.fileBytes);
    const bodyHtml = marked.parse(mdText);
    const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${baseName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; padding: 2.5rem; max-width: 850px; margin: auto; color: #222; }
    h1, h2, h3 { color: #111; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    pre { background: #f4f4f5; padding: 12px; border-radius: 6px; overflow-x: auto; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
    return { data: fullHtml, mimeType, downloadFileName };
  }

  // 7. HTML -> Markdown (MD)
  if (source === 'html' && target === 'md') {
    const htmlText = textDecoder.decode(options.fileBytes);
    const markdown = htmlToMarkdown(htmlText);
    return { data: markdown, mimeType, downloadFileName };
  }

  // 8. TXT -> Markdown (MD)
  if (source === 'txt' && target === 'md') {
    const text = textDecoder.decode(options.fileBytes);
    const md = `# ${baseName}\n\n${text}`;
    return { data: md, mimeType, downloadFileName };
  }

  // 9. TXT -> HTML
  if (source === 'txt' && target === 'html') {
    const text = textDecoder.decode(options.fileBytes);
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${baseName}</title><style>body{font-family:sans-serif;line-height:1.6;padding:2rem;max-width:800px;margin:auto;white-space:pre-wrap;}</style></head><body>${escaped}</body></html>`;
    return { data: html, mimeType, downloadFileName };
  }

  // 10. TXT -> PDF (via pdf-lib)
  if (source === 'txt' && target === 'pdf') {
    const text = textDecoder.decode(options.fileBytes);
    const pdfBytes = await textToPdf(text);
    return { data: pdfBytes, mimeType, downloadFileName };
  }

  // 11. JPG / JPEG / PNG -> PDF (via pdf-lib)
  if ((source === 'jpg' || source === 'jpeg' || source === 'png') && target === 'pdf') {
    const pdfBytes = await imageToPdf(options.fileBytes, source);
    return { data: pdfBytes, mimeType, downloadFileName };
  }

  // For any other format pair, it requires native binaries (LibreOffice, FFmpeg, Sharp, COM)
  throw new Error(
    `NATIVE_ENGINE_REQUIRED: La conversión de '${source.toUpperCase()}' a '${target.toUpperCase()}' requiere un motor de procesamiento con binarios del sistema (LibreOffice / FFmpeg / Sharp) que no está disponible en Cloudflare Workers (V8 Isolates).`,
  );
}
